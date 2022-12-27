mod helpers;

use helpers::{new_demo_project, moeth, delete_project};

/// $ moeth run 'main()'
/// $ moeth run 'one_param(true)'
/// $ moeth run 'two_params(1,1)'
#[test]
fn test_cmd_moeth_run_with_call() {
    let project_name = "project_run_with_call";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in ["main()", "one_param(true)", "two_params(1,1)"] {
        moeth(&["run", call], &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}

#[test]
fn test_cmd_moeth_run_with_params() {
    let project_name = "project_run_with_params";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in [
        vec!["run", "one_param", "-a", "true"],
        vec!["run", "two_params", "--args", "1", "1"],
    ] {
        moeth(&call, &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}

/// With type
/// $ moeth run 'with_type<u8>(1)'
/// $ moeth run 'with_type(1)' -t u8
/// $ moeth run 'with_type' -a 1 -t u8
#[test]
fn test_cmd_moeth_run_with_type() {
    let project_name = "project_run_with_type";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in [
        vec!["run", "with_type<u8>(1)"],
        vec!["run", "with_type(1)", "-t", "u8"],
        vec!["run", "with_type", "-a", "1", "-t", "u8"],
    ] {
        moeth(&call, &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}

/// multiple scripts
/// $ moeth run 'script_1(true)'
/// $ moeth run 'script_2(1,1)'
#[test]
#[ignore]
fn test_cmd_moeth_run_multiple() {
    let project_name = "project_run_multiple";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in ["script_1(true)", "script_2(1,1)"] {
        moeth(&["run", call], &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}
