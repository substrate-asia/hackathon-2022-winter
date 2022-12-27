mod helpers;

use std::fs;
use crate::helpers::{moeth, delete_project, get_project_name_from_toml, new_demo_project};

/// Creating a project in an existing folder
/// $ moeth init NAME_PROJECT
#[test]
fn test_cmd_moeth_init() {
    // Project name and path
    let project_name = "project_init_without_arguments";
    let project_path = new_demo_project(project_name).unwrap();

    fs::remove_file(project_path.join("Move.toml")).unwrap();

    moeth(&["init", project_name], &project_path).unwrap();

    assert_eq!(
        get_project_name_from_toml(&project_path),
        Some(project_name.to_string())
    );

    delete_project(&project_path).unwrap();
}
