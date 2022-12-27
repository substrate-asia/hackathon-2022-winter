mod helpers;

use crate::helpers::{new_demo_project, delete_project, build, moeth};

/// $ moeth clean
#[test]
fn test_cmd_moeth_clean() {
    let project_name = "project_clean";
    let project_dir = new_demo_project(project_name).unwrap();
    build(&project_dir).unwrap();

    assert!(project_dir.join("build").exists());
    moeth(&["clean"], &project_dir).unwrap();
    assert!(!project_dir.join("build").exists());

    delete_project(&project_dir).unwrap();
}
