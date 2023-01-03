use std::env;
use std::path::{PathBuf, Path};

use anyhow::{Result, Error};
use clap::Parser;
use semver::{Version, VersionReq};

use move_cli::{Move};
use move_core_types::errmap::ErrorMapping;

use crate::{
    MOETH_VERSION, MOETH_HASH, MOVE_STDLIB_VERSION, DIEM_VERSION, DIEM_HASH, ERROR_DESCRIPTIONS,
};
use crate::cmd::clean::Clean;
use crate::cmd::run::Run;
use crate::cmd::call::ExecuteTransaction;
use crate::cmd::key::KeyCommand;
use crate::cmd::deploy::Deploy;
use crate::cmd::view::View;
use crate::context::Context;
use crate::natives::{all_natives, pontem_cost_table};

#[derive(Parser)]
#[clap(
    name = "Moeth",
    version = git_hash::crate_version_with_git_hash_short!(),
    long_version = create_long_version(),
)]
struct MoethOpt {
    #[clap(flatten)]
    pub move_args: Move,

    #[clap(subcommand)]
    pub cmd: MoethCommands,
}

/// Move cli and moeth commands.
#[derive(clap::Subcommand)]
pub enum MoethCommands {
    #[clap(flatten)]
    DiemCommand(move_cli::Command),

    #[clap(
        about = "Create a new Move project. Alias for 'package new'",
        display_order = 10
    )]
    New,
    #[clap(
        about = "Create new Move project in the current directory. Alias for 'package new --cwd'",
        display_order = 11
    )]
    Init,
    #[clap(about = "Build project. Alias for 'package build'", display_order = 12)]
    Build,
    #[clap(about = "Run tests. Alias for 'package test'", display_order = 13)]
    Test,
    #[clap(
        about = "Run Move prover. Alias for 'package prove'",
        display_order = 14
    )]
    Prove,

    #[clap(about = "Remove ./build directory", display_order = 15)]
    Clean {
        #[clap(flatten)]
        cmd: Clean,
    },
    #[clap(about = "Run move script", display_order = 16)]
    Run {
        #[clap(flatten)]
        cmd: Run,
    },
    #[clap(
        about = "Create and execute transaction on the node",
        display_order = 17
    )]
    Call {
        #[clap(flatten)]
        cmd: ExecuteTransaction,
    },
    #[clap(
        about = "Create package bundle and publish it to the network",
        display_order = 18
    )]
    Deploy {
        #[clap(flatten)]
        cmd: Deploy,
    },
    #[clap(about = "Manage wallet keys", subcommand)]
    Key(KeyCommand),
    #[clap(about = "Resource viewer", display_order = 19)]
    View {
        #[clap(flatten)]
        cmd: View,
    },
}

fn preprocess_args(args: Vec<String>) -> Vec<String> {
    let moeth = args.get(0).unwrap().clone();
    let mut line = args.join(" ");
    line = line.replace(&format!("{} new", moeth), &format!("{} package new", moeth));
    line = line.replace(
        &format!("{} build", moeth),
        &format!("{} package build", moeth),
    );
    line = line.replace(&format!("{} test", moeth), &format!("{} package test", moeth));
    line = line.replace(
        &format!("{} prove", moeth),
        &format!("{} package prove", moeth),
    );
    line = line.replace(
        &format!("{} init", moeth),
        &format!("{} package new --cwd", moeth),
    );
    line.split(' ').map(String::from).collect()
}

/// Public interface for the CLI (useful for testing).
pub fn execute(args: Vec<String>, cwd: PathBuf) -> Result<()> {
    if let Some(minimal_version) = get_minimal_moeth_version(&cwd) {
        check_moeth_version(&minimal_version)?;
    }
    let args = preprocess_args(args);
    let MoethOpt { move_args, cmd } = MoethOpt::parse_from(args);

    // `moeth clean`|`moeth key` needs empty context and no preparation, so try it before other commands
    match cmd {
        MoethCommands::Clean { mut cmd } => {
            cmd.apply(&cwd);
            return Ok(());
        }
        MoethCommands::Key(mut cmd) => return cmd.apply(),
        _ => (),
    };

    let error_descriptions: ErrorMapping = bcs::from_bytes(ERROR_DESCRIPTIONS)?;
    let native_functions = all_natives();
    let cost_table = pontem_cost_table();

    // process all diem commands before moeth commands
    if let MoethCommands::DiemCommand(cmd) = cmd {
        return move_cli::run_cli(
            native_functions,
            &cost_table,
            &error_descriptions,
            &move_args,
            &cmd,
        );
    }

    let mut ctx = Context::new(
        cwd,
        move_args,
        error_descriptions,
        native_functions,
        cost_table,
    )?;

    match cmd {
        MoethCommands::Run { mut cmd } => cmd.apply(&mut ctx),
        MoethCommands::Call { mut cmd } => cmd.apply(&mut ctx),
        MoethCommands::Deploy { mut cmd } => cmd.apply(&mut ctx),
        MoethCommands::View { mut cmd } => cmd.apply(&mut ctx),
        MoethCommands::Build
        | MoethCommands::Test
        | MoethCommands::Prove
        | MoethCommands::New
        | MoethCommands::Init => {
            unreachable!("Should never be reached, as all those commands are preprocessed into package-prefixed commands")
        }
        MoethCommands::Clean { .. } | MoethCommands::DiemCommand(_) | MoethCommands::Key { .. } => {
            unreachable!("Handled in the beginning")
        }
    }
}

/// Check if Moeth version is suitable for this project
fn check_moeth_version(req_ver: &str) -> Result<(), Error> {
    let act_ver = env!("CARGO_PKG_VERSION");
    let req = VersionReq::parse(req_ver)
        .map_err(|err| Error::new(err).context("Failed to parse moeth_version from Move.toml"))?;
    let actual = Version::parse(act_ver).expect("Expected valid moeth version");
    if !req.matches(&actual) {
        Err(anyhow!("The moeth version must meet the conditions '{}'. The current version of moeth is '{}'.", req_ver, act_ver))
    } else {
        Ok(())
    }
}

/// To display the full version of "Moeth"
fn create_long_version() -> &'static str {
    let moeth: String = [MOETH_VERSION, MOETH_HASH]
        .iter()
        .filter(|str| !str.is_empty())
        .map(|str| str.to_string())
        .collect::<Vec<String>>()
        .join("-");
    let diem: String = [DIEM_VERSION, DIEM_HASH]
        .iter()
        .filter(|str| !str.is_empty())
        .map(|str| str.to_string())
        .collect::<Vec<String>>()
        .join("-");

    Box::leak(
        format!(
            "{}\n\
            Diem {}\n\
            Move-Stdlib {}",
            moeth, diem, MOVE_STDLIB_VERSION
        )
        .into_boxed_str(),
    )
}

fn get_minimal_moeth_version(project_path: &Path) -> Option<String> {
    let move_toml_path = project_path.join("Move.toml");
    if !move_toml_path.exists() {
        return None;
    }
    let move_toml_content = std::fs::read_to_string(&move_toml_path).ok()?;
    let move_toml = toml::from_str::<toml::Value>(&move_toml_content).ok()?;
    move_toml
        .get("package")
        .and_then(|pack| pack.get("moeth_version"))
        .and_then(|name| name.as_str().map(|t| t.to_string()))
}

#[cfg(test)]
mod tests {
    use semver::Version;
    use super::check_moeth_version;

    #[test]
    fn test_moeth_version() {
        Version::parse(env!("CARGO_PKG_VERSION")).unwrap();
    }

    #[test]
    fn test_check_moeth_version() {
        check_moeth_version(">=1.2.3, <1.8.0").unwrap();
        check_moeth_version("<1.2.2").unwrap_err();
    }
}
