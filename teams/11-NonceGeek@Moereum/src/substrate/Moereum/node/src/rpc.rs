//! A collection of node-specific RPC methods.
//! Substrate provides the `sc-rpc` crate, which defines the core RPC layer
//! used by Substrate nodes. This file extends those RPC definitions with
//! capabilities that are specific to this project's runtime configuration.

use std::{sync::Arc, time::Duration};
use moereum_runtime::{opaque::Block, AccountId, Balance, Index, Hash};
use sp_api::{HeaderT, ProvideRuntimeApi};
use sp_blockchain::{Error as BlockChainError, HeaderBackend, HeaderMetadata};
use sp_block_builder::BlockBuilder;
use sp_core::H256;
pub use sc_rpc_api::DenyUnsafe;
use sc_transaction_pool_api::TransactionPool;
use sc_network::NetworkService;
use sp_mvm_rpc_runtime::MVMApiRuntime;
use sp_mvm_rpc::{MVMApiRpc, MVMApi};

// EVM
use std::collections::BTreeMap;
use fc_mapping_sync::{MappingSyncWorker, SyncStrategy};
use sp_runtime::traits::{BlakeTwo256, Block as BlockT};
use sc_client_api::{
    backend::{AuxStore, Backend, StateBackend, StorageProvider},
    client::BlockchainEvents,
    BlockOf
};
use sc_transaction_pool::{ChainApi, Pool};
use fc_rpc_core::types::{FeeHistoryCache, FeeHistoryCacheLimit, FilterPool};
use jsonrpc_pubsub::manager::SubscriptionManager;
use fp_storage::EthereumStorageSchema;
use fc_rpc::{EthBlockDataCacheTask, EthTask, OverrideHandle, RuntimeApiStorageOverride, SchemaV1Override, SchemaV2Override, StorageOverride};
use futures::StreamExt;
use sc_rpc::SubscriptionTaskExecutor;
use sc_service::TaskManager;

/// Full client dependencies.
pub struct FullDeps<C, P,A: ChainApi> {
    /// The client instance to use.
    pub client: Arc<C>,
    /// Transaction pool instance.
    pub pool: Arc<P>,
    /// Whether to deny unsafe calls
    pub deny_unsafe: DenyUnsafe,
    /// Graph pool instance.
    pub graph: Arc<Pool<A>>,
    /// The Node authority flag
    pub is_authority: bool,
    /// Network service
    pub network: Arc<NetworkService<Block, Hash>>,
    /// EthFilterApi pool.
    pub filter_pool: Option<FilterPool>,
    /// Backend.
    pub backend: Arc<fc_db::Backend<Block>>,
    /// Maximum number of logs in a query.
    pub max_past_logs: u32,
    /// Maximum fee history cache size.
    pub fee_history_limit: FeeHistoryCacheLimit,
    /// Fee history cache.
    pub fee_history_cache: FeeHistoryCache,
    /// Ethereum data access overrides.
    pub overrides: Arc<OverrideHandle<Block>>,
    /// Cache for Ethereum block data.
    pub block_data_cache: Arc<EthBlockDataCacheTask<Block>>,
}

pub fn overrides_handle<C, BE>(client: Arc<C>) -> Arc<OverrideHandle<Block>>
    where
        C: ProvideRuntimeApi<Block> + StorageProvider<Block, BE> + AuxStore,
        C: HeaderBackend<Block> + HeaderMetadata<Block, Error=BlockChainError>,
        C: Send + Sync + 'static,
        C::Api: sp_api::ApiExt<Block>
            + fp_rpc::EthereumRuntimeRPCApi<Block>
            + fp_rpc::ConvertTransactionRuntimeApi<Block>,
        BE: Backend<Block> + 'static,
        BE::State: StateBackend<BlakeTwo256>,
{
    let mut overrides_map = BTreeMap::new();
    overrides_map.insert(
        EthereumStorageSchema::V1,
        Box::new(SchemaV1Override::new(client.clone()))
            as Box<dyn StorageOverride<_> + Send + Sync>,
    );
    overrides_map.insert(
        EthereumStorageSchema::V2,
        Box::new(SchemaV2Override::new(client.clone()))
            as Box<dyn StorageOverride<_> + Send + Sync>,
    );

    Arc::new(OverrideHandle {
        schemas: overrides_map,
        fallback: Box::new(RuntimeApiStorageOverride::new(client)),
    })
}

/// Instantiate all full RPC extensions.
pub fn create_full<C, P, BE, A>(
    deps: FullDeps<C, P, A>,
    subscription_task_executor: SubscriptionTaskExecutor) -> jsonrpc_core::IoHandler<sc_rpc::Metadata>
    where
        BE: Backend<Block> + 'static,
        BE::State: StateBackend<BlakeTwo256>,
        C: ProvideRuntimeApi<Block> + StorageProvider<Block, BE> + AuxStore,
        C: BlockchainEvents<Block>,
        C: HeaderBackend<Block> + HeaderMetadata<Block, Error=BlockChainError>,
        C: Send + Sync + 'static,
        C::Api: substrate_frame_rpc_system::AccountNonceApi<Block, AccountId, Index>,
        C::Api: pallet_transaction_payment_rpc::TransactionPaymentRuntimeApi<Block, Balance>,
        C::Api: BlockBuilder<Block>,
        C::Api: MVMApiRuntime<Block, AccountId>,
        C::Api: fp_rpc::ConvertTransactionRuntimeApi<Block>,
        C::Api: fp_rpc::EthereumRuntimeRPCApi<Block>,
        P: TransactionPool<Block=Block> + Sync + Send + 'static,
        A: ChainApi<Block=Block> + 'static,
{
    use substrate_frame_rpc_system::{FullSystem, SystemApi};
    use pallet_transaction_payment_rpc::{TransactionPayment, TransactionPaymentApi};
    use fc_rpc::{
        Eth, EthApi, EthFilter, EthFilterApi, EthPubSub,
        EthPubSubApi, HexEncodedIdProvider, Net, NetApi, Web3,
        Web3Api,
    };

    let mut io = jsonrpc_core::IoHandler::default();
    let FullDeps {
        client,
        pool,
        graph,
        deny_unsafe,
        is_authority,
        network,
        filter_pool,
        backend,
        max_past_logs,
        fee_history_limit,
        fee_history_cache,
        overrides,
        block_data_cache,
    } = deps;

    io.extend_with(SystemApi::to_delegate(FullSystem::new(
        client.clone(),
        pool.clone(),
        deny_unsafe,
    )));

    io.extend_with(TransactionPaymentApi::to_delegate(TransactionPayment::new(
        client.clone(),
    )));

    {
        io.extend_with(EthApi::to_delegate(Eth::new(
            client.clone(),
            pool.clone(),
            graph,
            Some(moereum_runtime::TransactionConverter),
            network.clone(),
            Vec::new(),
            overrides.clone(),
            backend.clone(),
            is_authority,
            block_data_cache.clone(),
            fee_history_cache,
            fee_history_limit
        )));
        if let Some(filter_pool) = filter_pool {
            io.extend_with(EthFilterApi::to_delegate(EthFilter::new(
                client.clone(),
                backend,
                filter_pool,
                500_usize, // max stored filters
                max_past_logs,
                block_data_cache.clone(),
            )));
        }
        io.extend_with(NetApi::to_delegate(Net::new(
            client.clone(),
            network.clone(),
            // Whether to format the `peer_count` response as Hex (default) or not.
            true,
        )));
        io.extend_with(Web3Api::to_delegate(Web3::new(client.clone())));
        io.extend_with(EthPubSubApi::to_delegate(EthPubSub::new(
            pool,
            client.clone(),
            network,
            SubscriptionManager::<HexEncodedIdProvider>::with_id_provider(
                HexEncodedIdProvider::default(),
                Arc::new(subscription_task_executor),
            ),
            overrides,
        )));
    }

    io.extend_with(MVMApiRpc::to_delegate(MVMApi::new(client.clone())));

    io
}

pub struct SpawnTasksParams<'a, B: BlockT, C, BE> {
    pub task_manager: &'a TaskManager,
    pub client: Arc<C>,
    pub substrate_backend: Arc<BE>,
    pub frontier_backend: Arc<fc_db::Backend<B>>,
    pub filter_pool: Option<FilterPool>,
    pub overrides: Arc<OverrideHandle<B>>,
    pub fee_history_limit: u64,
    pub fee_history_cache: FeeHistoryCache,
}

/// Spawn the tasks that are required to run Moonbeam.
pub fn spawn_essential_tasks<B, C, BE>(params: SpawnTasksParams<B, C, BE>)
    where
        C: ProvideRuntimeApi<B> + BlockOf,
        C: HeaderBackend<B> + HeaderMetadata<B, Error = BlockChainError> + 'static,
        C: BlockchainEvents<B> + StorageProvider<B, BE>,
        C: Send + Sync + 'static,
        C::Api: fp_rpc::EthereumRuntimeRPCApi<B>,
        C::Api: BlockBuilder<B>,
        B: BlockT<Hash = H256> + Send + Sync + 'static,
        B::Header: HeaderT<Number = u32>,
        BE: Backend<B> + 'static,
        BE::State: StateBackend<BlakeTwo256>,
{
    // Frontier offchain DB task. Essential.
    // Maps emulated ethereum data to substrate native data.
    params.task_manager.spawn_essential_handle().spawn(
        "frontier-mapping-sync-worker",
        Some("frontier"),
        MappingSyncWorker::new(
            params.client.import_notification_stream(),
            Duration::new(6, 0),
            params.client.clone(),
            params.substrate_backend.clone(),
            params.frontier_backend.clone(),
            3,
            0,
            SyncStrategy::Parachain,
        )
            .for_each(|()| futures::future::ready(())),
    );

    // Frontier `EthFilterApi` maintenance.
    // Manages the pool of user-created Filters.
    if let Some(filter_pool) = params.filter_pool {
        // Each filter is allowed to stay in the pool for 100 blocks.
        const FILTER_RETAIN_THRESHOLD: u64 = 100;
        params.task_manager.spawn_essential_handle().spawn(
            "frontier-filter-pool",
            Some("frontier"),
            EthTask::filter_pool_task(
                Arc::clone(&params.client),
                filter_pool,
                FILTER_RETAIN_THRESHOLD,
            ),
        );
    }

    params.task_manager.spawn_essential_handle().spawn(
        "frontier-schema-cache-task",
        Some("frontier"),
        EthTask::ethereum_schema_cache_task(
            Arc::clone(&params.client),
            Arc::clone(&params.frontier_backend),
        ),
    );

    // Spawn Frontier FeeHistory cache maintenance task.
    params.task_manager.spawn_essential_handle().spawn(
        "frontier-fee-history",
        Some("frontier"),
        EthTask::fee_history_task(
            Arc::clone(&params.client),
            Arc::clone(&params.overrides),
            params.fee_history_cache,
            params.fee_history_limit,
        ),
    );
}
