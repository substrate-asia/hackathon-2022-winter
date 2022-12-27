use stdlib_fetch::{fetch, FetchConfig};
use substrate_build_script_utils::{generate_cargo_keys, rerun_if_git_head_changed};

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    generate_cargo_keys();
    rerun_if_git_head_changed();

    fetch(FetchConfig {
        git_repo: "https://github.com/NonceGeek/move-stdlib",
        rev: Some("release-v1.0.0"),
        path_to_clone: "../move/move-stdlib",
        build_with_dove: true,
    })
    .unwrap();

    fetch(FetchConfig {
        git_repo: "https://github.com/NonceGeek/moereum-stdlib.git",
        rev: Some("release-v1.0.0"),
        path_to_clone: "../move/moereum-stdlib",
        build_with_dove: true,
    })
    .unwrap();
}
