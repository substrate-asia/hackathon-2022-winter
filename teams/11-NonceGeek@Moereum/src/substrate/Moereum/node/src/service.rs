use cumulus_client_cli::CollatorOptions;
use cumulus_relay_chain_inprocess_interface::build_inprocess_relay_chain;
use cumulus_relay_chain_interface::{RelayChainError, RelayChainInterface};
use cumulus_client_service::{
    prepare_node_config, start_collator, start_full_node, StartCollatorParams,
    StartFullNodeParams,
};
use std::time::Duration;
use cumulus_primitives_core::ParaId;
use moereum_runtime::RuntimeApi;
use sc_service::{Configuration, PartialComponents, Role, TFullBackend, TFullClient, TaskManager};
use sc_telemetry::{Telemetry, TelemetryHandle, TelemetryWorker, TelemetryWorkerHandle};
use std::sync::Arc;
use substrate_prometheus_endpoint::Registry;
use sp_keystore::SyncCryptoStorePtr;
use cumulus_client_consensus_common::ParachainConsensus;
use cumulus_client_network::BlockAnnounceValidator;
use nimbus_primitives::NimbusId;
use nimbus_consensus::{BuildNimbusConsensusParams, NimbusConsensus};
use primitives::Block;
use sc_executor::NativeElseWasmExecutor;
use sp_runtime::Percent;

// EVM
use fc_consensus::FrontierBlockImport;
use fc_rpc_core::types::{FeeHistoryCache, FilterPool};
use sc_cli::SubstrateCli;
use sc_service::BasePath;
use std::{collections::BTreeMap, sync::Mutex};

type FullBackend = TFullBackend<Block>;
type FullClient =
    TFullClient<Block, RuntimeApi, NativeElseWasmExecutor<ParachainRuntimeExecutor>>;
type MaybeSelectChain = Option<sc_consensus::LongestChain<FullBackend, Block>>;

pub type HostFunctions = frame_benchmarking::benchmarking::HostFunctions;

pub struct ParachainRuntimeExecutor;

impl sc_executor::NativeExecutionDispatch for ParachainRuntimeExecutor {
    type ExtendHostFunctions = HostFunctions;

    fn dispatch(method: &str, data: &[u8]) -> Option<Vec<u8>> {
        moereum_runtime::api::dispatch(method, data)
    }

    fn native_version() -> sc_executor::NativeVersion {
        moereum_runtime::native_version()
    }
}

pub fn frontier_database_dir(config: &Configuration) -> std::path::PathBuf {
    let config_dir = config
        .base_path
        .as_ref()
        .map(|base_path| base_path.config_dir(config.chain_spec.id()))
        .unwrap_or_else(|| {
            BasePath::from_project("", "", &crate::cli::Cli::executable_name())
                .config_dir(config.chain_spec.id())
        });
    config_dir.join("frontier").join("db")
}

pub fn open_frontier_backend(
    config: &Configuration,
) -> Result<Arc<fc_db::Backend<Block>>, String> {
    Ok(Arc::new(fc_db::Backend::<Block>::new(
        &fc_db::DatabaseSettings {
            source: fc_db::DatabaseSettingsSrc::RocksDb {
                path: frontier_database_dir(config),
                cache_size: 0,
            },
        },
    )?))
}

/// Starts a `ServiceBuilder` for a full service.
///
/// Use this function if you don't actually need the full service, but just the builder in order to
/// be able to perform chain operations.
pub fn new_partial(
    config: &Configuration,
    dev_service: bool,
) -> Result<
    PartialComponents<
        FullClient,
        TFullBackend<Block>,
        MaybeSelectChain,
        sc_consensus::DefaultImportQueue<Block, FullClient>,
        sc_transaction_pool::FullPool<Block, FullClient>,
        (
            FrontierBlockImport<Block, Arc<FullClient>, FullClient>,
            Option<FilterPool>,
            Option<Telemetry>,
            Option<TelemetryWorkerHandle>,
            Arc<fc_db::Backend<Block>>,
            FeeHistoryCache,
        ),
    >,
    sc_service::Error,
> {
    let telemetry = config
        .telemetry_endpoints
        .clone()
        .filter(|x| !x.is_empty())
        .map(|endpoints| -> Result<_, sc_telemetry::Error> {
            let worker = TelemetryWorker::new(16)?;
            let telemetry = worker.handle().new_telemetry(endpoints);
            Ok((worker, telemetry))
        })
        .transpose()?;

    let executor = NativeElseWasmExecutor::new(
        config.wasm_method,
        config.default_heap_pages,
        config.max_runtime_instances,
        config.runtime_cache_size,
    );

    let (client, backend, keystore_container, task_manager) =
        sc_service::new_full_parts::<Block, RuntimeApi, _>(
            &config,
            telemetry.as_ref().map(|(_, telemetry)| telemetry.handle()),
            executor,
        )?;
    let client = Arc::new(client);

    let telemetry_worker_handle = telemetry.as_ref().map(|(worker, _)| worker.handle());

    let telemetry = telemetry.map(|(worker, telemetry)| {
        task_manager
            .spawn_handle()
            .spawn("telemetry", None, worker.run());
        telemetry
    });

    let transaction_pool = sc_transaction_pool::BasicPool::new_full(
        config.transaction_pool.clone(),
        config.role.is_authority().into(),
        config.prometheus_registry(),
        task_manager.spawn_essential_handle(),
        client.clone(),
    );
    let filter_pool: Option<FilterPool> = Some(Arc::new(Mutex::new(BTreeMap::new())));
    let fee_history_cache: FeeHistoryCache = Arc::new(Mutex::new(BTreeMap::new()));

    let frontier_backend = open_frontier_backend(config)?;

    let frontier_block_import =
        FrontierBlockImport::new(client.clone(), client.clone(), frontier_backend.clone());

    let import_queue = if dev_service {
        // There is a bug in this import queue where it doesn't properly check inherents:
        // https://github.com/paritytech/substrate/issues/8164
        sc_consensus_manual_seal::import_queue(
            Box::new(client.clone()),
            &task_manager.spawn_essential_handle(),
            config.prometheus_registry(),
        )
    } else {
        nimbus_consensus::import_queue(
            client.clone(),
            client.clone(),
            move |_, _| async move {
                let time = sp_timestamp::InherentDataProvider::from_system_time();

                Ok((time,))
            },
            &task_manager.spawn_essential_handle(),
            config.prometheus_registry().clone(),
            !dev_service,
        )?
    };

    let maybe_select_chain = if dev_service {
        Some(sc_consensus::LongestChain::new(backend.clone()))
    } else {
        None
    };

    Ok(PartialComponents {
        backend,
        client,
        import_queue,
        keystore_container,
        task_manager,
        transaction_pool,
        select_chain: maybe_select_chain,
        other: (
            frontier_block_import,
            filter_pool,
            telemetry,
            telemetry_worker_handle,
            frontier_backend,
            fee_history_cache,
        ),
    })
}

/// Start a node with the given parachain `Configuration` and relay chain `Configuration`.
///
/// This is the actual implementation that is abstract over the executor and the runtime api.
#[sc_tracing::logging::prefix_logs_with("Parachain")]
async fn start_node_impl(
    parachain_config: Configuration,
    polkadot_config: Configuration,
    collator_options: CollatorOptions,
    id: ParaId,
) -> sc_service::error::Result<(TaskManager, Arc<FullClient>)> {
    if matches!(parachain_config.role, Role::Light) {
        return Err("Light client not supported!".into());
    }

    let parachain_config = prepare_node_config(parachain_config);

    let params = new_partial(&parachain_config, false)?;
    let (
        _block_import,
        filter_pool,
        mut telemetry,
        telemetry_worker_handle,
        frontier_backend,
        fee_history_cache,
    ) = params.other;

    let mut task_manager = params.task_manager;

    let (relay_chain_full_node, collator_key) = build_inprocess_relay_chain(
        polkadot_config,
        &parachain_config,
        telemetry_worker_handle,
        &mut task_manager,
    )
    .map_err(|e| match e {
        RelayChainError::ServiceError(polkadot_service::Error::Sub(x)) => x,
        s => s.to_string().into(),
    })?;

    let client = params.client.clone();
    let backend = params.backend.clone();

    let block_announce_validator = BlockAnnounceValidator::new(relay_chain_full_node.clone(), id);

    let is_validator = parachain_config.role.is_authority();
    let force_authoring = parachain_config.force_authoring;
    let prometheus_registry = parachain_config.prometheus_registry().cloned();
    let transaction_pool = params.transaction_pool.clone();
    let import_queue = cumulus_client_service::SharedImportQueue::new(params.import_queue);

    let (network, system_rpc_tx, start_network) =
        sc_service::build_network(sc_service::BuildNetworkParams {
            config: &parachain_config,
            client: client.clone(),
            transaction_pool: transaction_pool.clone(),
            spawn_handle: task_manager.spawn_handle(),
            import_queue: import_queue.clone(),
            warp_sync: None,
            block_announce_validator_builder: Some(Box::new(|_| {
                Box::new(block_announce_validator)
            })),
        })?;

    let overrides = crate::rpc::overrides_handle(client.clone());
    let fee_history_limit = 2048;

    crate::rpc::spawn_essential_tasks(crate::rpc::SpawnTasksParams {
        task_manager: &task_manager,
        client: client.clone(),
        substrate_backend: backend.clone(),
        frontier_backend: frontier_backend.clone(),
        filter_pool: filter_pool.clone(),
        overrides: overrides.clone(),
        fee_history_limit,
        fee_history_cache: fee_history_cache.clone(),
    });

    let block_data_cache = Arc::new(fc_rpc::EthBlockDataCacheTask::new(
        task_manager.spawn_handle(),
        overrides.clone(),
        50,
        50,
        prometheus_registry.clone(),
    ));

    // variable `rpc_config` will be moved in next code block, we need to
    // save param `relay_chain_rpc_url` to be able to use it later.
    // let relay_chain_rpc_url = rpc_config.relay_chain_rpc_url.clone();

    let rpc_extensions_builder = {
        let client = client.clone();
        let pool = transaction_pool.clone();
        let network = network.clone();
        let filter_pool = filter_pool.clone();
        let frontier_backend = frontier_backend.clone();
        let overrides = overrides.clone();
        let fee_history_cache = fee_history_cache.clone();
        let is_authority = false;
        let max_past_logs = 10000;

        Box::new(move |deny_unsafe, subscription_task_executor| {
            let deps = crate::rpc::FullDeps {
                client: client.clone(),
                pool: pool.clone(),
                deny_unsafe,
                graph: pool.pool().clone(),
                is_authority,
                network: network.clone(),
                filter_pool: filter_pool.clone(),
                backend: frontier_backend.clone(),
                max_past_logs,
                fee_history_limit,
                fee_history_cache: fee_history_cache.clone(),
                overrides: overrides.clone(),
                block_data_cache: block_data_cache.clone(),
            };

            let io = crate::rpc::create_full(deps, subscription_task_executor);
            Ok(io)
        })
    };

    sc_service::spawn_tasks(sc_service::SpawnTasksParams {
        rpc_extensions_builder,
        client: client.clone(),
        transaction_pool: transaction_pool.clone(),
        task_manager: &mut task_manager,
        config: parachain_config,
        keystore: params.keystore_container.sync_keystore(),
        backend: backend.clone(),
        network: network.clone(),
        system_rpc_tx,
        telemetry: telemetry.as_mut(),
    })?;

    let announce_block = {
        let network = network.clone();
        Arc::new(move |hash, data| network.announce_block(hash, data))
    };

    let relay_chain_slot_duration = Duration::from_secs(6);

    if is_validator {
        let parachain_consensus = build_consensus(
            id,
            client.clone(),
            prometheus_registry.as_ref(),
            telemetry.as_ref().map(|t| t.handle()),
            &task_manager,
            relay_chain_full_node.clone(),
            transaction_pool,
            params.keystore_container.sync_keystore(),
            force_authoring,
        )?;
        let spawner = task_manager.spawn_handle();
        let params = StartCollatorParams {
            para_id: id,
            block_status: client.clone(),
            announce_block,
            client: client.clone(),
            task_manager: &mut task_manager,
            relay_chain_interface: relay_chain_full_node,
            spawner,
            parachain_consensus,
            import_queue,
            collator_key: collator_key.ok_or(sc_service::error::Error::Other(
                "Collator Key is None".to_string(),
            ))?,
            relay_chain_slot_duration,
        };

        start_collator(params).await?;
    } else {
        let params = StartFullNodeParams {
            client: client.clone(),
            announce_block,
            task_manager: &mut task_manager,
            para_id: id,
            relay_chain_interface: relay_chain_full_node,
            relay_chain_slot_duration,
            import_queue,
            collator_options,
        };

        start_full_node(params)?;
    }

    start_network.start_network();

    Ok((task_manager, client))
}

fn build_consensus(
    id: ParaId,
    client: Arc<FullClient>,
    prometheus_registry: Option<&Registry>,
    telemetry: Option<TelemetryHandle>,
    task_manager: &TaskManager,
    relay_chain_node: Arc<dyn RelayChainInterface>,
    transaction_pool: Arc<sc_transaction_pool::FullPool<Block, FullClient>>,
    keystore: SyncCryptoStorePtr,
    force_authoring: bool,
) -> Result<Box<dyn ParachainConsensus<Block>>, sc_service::Error> {
    let mut proposer_factory = sc_basic_authorship::ProposerFactory::with_proof_recording(
        task_manager.spawn_handle(),
        client.clone(),
        transaction_pool,
        prometheus_registry.clone(),
        telemetry.clone(),
    );
    proposer_factory.set_soft_deadline(Percent::from_percent(100));

    let create_inherent_data_providers = move |_, (relay_parent, validation_data, author_id)| {
        let relay_chain_node = relay_chain_node.clone();
        async move {
            let parachain_inherent =
                cumulus_primitives_parachain_inherent::ParachainInherentData::create_at(
                    relay_parent,
                    &relay_chain_node,
                    &validation_data,
                    id,
                )
                .await;

            let time = sp_timestamp::InherentDataProvider::from_system_time();

            let parachain_inherent = parachain_inherent.ok_or_else(|| {
                Box::<dyn std::error::Error + Send + Sync>::from(
                    "Failed to create parachain inherent",
                )
            })?;

            let author = nimbus_primitives::InherentDataProvider::<NimbusId>(author_id);

            Ok((time, parachain_inherent, author))
        }
    };

    Ok(NimbusConsensus::build(BuildNimbusConsensusParams {
        para_id: id,
        proposer_factory,
        block_import: client.clone(),
        parachain_client: client.clone(),
        keystore,
        skip_prediction: force_authoring,
        create_inherent_data_providers,
    }))
}

/// Start a normal parachain node.
pub async fn start_node(
    parachain_config: Configuration,
    polkadot_config: Configuration,
    collator_options: CollatorOptions,
    id: ParaId,
) -> sc_service::error::Result<(TaskManager, Arc<FullClient>)> {
    start_node_impl(parachain_config, polkadot_config, collator_options, id).await
}
