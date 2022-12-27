mod helpers;

use helpers::{new_demo_project, moeth, delete_project};

/// $ moeth call 'main()'
/// $ moeth call 'one_param(true)'
/// $ moeth call 'two_params(1,1)'
#[test]
fn test_cmd_moeth_call() {
    let project_name = "project_call";
    let project_folder = new_demo_project(project_name).unwrap();

    for (name, call) in [
        ("main", "main()"),
        ("one_param", "one_param(true)"),
        ("two_params", "two_params(1,1)"),
    ] {
        moeth(&["call", call], &project_folder).unwrap();
        let tx_path = project_folder
            .join("build")
            .join("for_tests")
            .join("transaction")
            .join(format!("{}.mvt", name));
        assert!(tx_path.exists());
    }
    delete_project(&project_folder).unwrap();
}

/// $ moeth call 'one_param' -a true
/// $ moeth call 'two_params' --args 1 1
#[test]
fn test_cmd_moeth_call_with_params() {
    let project_name = "project_call_with_params";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in [
        vec!["call", "one_param", "-a", "true"],
        vec!["call", "two_params", "--args", "1", "1"],
    ] {
        moeth(&call, &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}

/// With type
/// $ moeth call 'with_type<u8>(1)'
/// $ moeth call 'with_type(1)' -t u8
/// $ moeth call 'with_type' -a 1 -t u8
#[test]
fn test_cmd_moeth_call_with_type() {
    let project_name = "project_call_with_type";
    let project_folder = new_demo_project(project_name).unwrap();

    for call in [
        vec!["call", "with_type<u8>(1)"],
        vec!["call", "with_type(1)", "-t", "u8"],
        vec!["call", "with_type", "-a", "1", "-t", "u8"],
    ] {
        moeth(&call, &project_folder).unwrap();
    }

    delete_project(&project_folder).unwrap();
}
