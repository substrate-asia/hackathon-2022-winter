#!/usr/bin/env zx

import {$} from "zx";
import * as storage from '../storage/nft_storage.js'
import * as ether from './../wallet/ether/ether.js';
import * as fs from 'fs';

export async function getGitRepoName() {
    const repo_path = (await $`git rev-parse --show-toplevel`).stdout;
    const repo_name = (await $`basename ${repo_path}|xargs echo -n`).stdout
    return repo_name
}

// Initialized empty GitVerse repository
export async function InitGitRepo() {
    await $`git init`
    const repo_name = await getGitRepoName()
    await ether.createGitRepoContract(repo_name)
}

export async function AddGitCode(pathlist) {
    for (const path of pathlist) {
        fs.stat(path, function(err, data) { 
            if (data.isFile() || data.isDirectory() ) {
                $`git add ${path}`
            } else {
                console.error(`path(${path}) does not exist`)
            }
         });
    }
}

// upload git tag code to storage
export async function UploadGitCodeByTag(tagName) {
    const tag_file_name = await genGitTagFile(tagName)
    const metadataCID = await storage.storeTagCode(tag_file_name)
    const repo_name = await getGitRepoName()

    await ether.uploadGitRepoToContract(repo_name, metadataCID)
    await $`rm ${tag_file_name}`
}

export async function UploadGitCodeByCommitID(comments) {
    if(comments == ""){
        comments = "commit code"
    }

    const exitCode = await ($`git commit -m ${comments}`).exitCode
    if (exitCode > 0) {
        console.error("nothing to commit, working tree clean")
    }

    let tagName = await ($`git rev-parse --short HEAD |xargs echo -n`)
    tagName = "tag_" + tagName
    
    UploadGitCodeByTag(tagName)
}

async function genGitTagFile(tag_name) {
    const exitCode = await ($`git tag ${tag_name}`).exitCode
    if (exitCode > 0) {
        console.error(`tag ${tag_name} already exists`)
    }
    const repo_path = (await $`git rev-parse --show-toplevel`).stdout;
    const repo_name = await $`basename ${repo_path}|xargs echo -n`
    const tag_file_name = `${repo_name}-${tag_name}.tar.gz`

    await $`git archive ${tag_name} --format=tar.gz --output ${tag_file_name}`

    return tag_file_name
}