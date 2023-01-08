#!/usr/bin/env node

import {$} from "zx";
import * as cess_storage from '../storage/cess_storage.js'
import * as nft_storage from '../storage/nft_storage.js'
import fs from 'fs';
import process from 'process';
import dotenv from 'dotenv'

import * as ether from './../wallet/ether/ether.js';

let storage;

function initStorage() {
    dotenv.config()
    if (process.env.STORAGE_PROVIDER == "CESS_STORAGE") {
        storage = cess_storage
    } else if (process.env.STORAGE_PROVIDER == "NFT_STORAGE") {
        storage = nft_storage
    }
    return process.env
}

export async function getGitRepoName() {
    const repo_path = (await $`git rev-parse --show-toplevel`.quiet()).stdout;
    const repo_name = (await $`basename ${repo_path}|xargs echo -n`.quiet()).stdout
    return repo_name.toLowerCase()
}

// Initialized empty gitverse code repository
export async function InitGitRepo() {
    initStorage()

    await $`git init`.quiet()
    const repo_name = await getGitRepoName()

    if (process.env.STORAGE_PROVIDER == "CESS_STORAGE") {
        // create bucket based on gitverse repository name
        await storage.createBucket(repo_name)
    }
    await ether.createGitRepoContract(repo_name)
    return repo_name
}

// add files to gitverse code repository
export async function AddGitCode(pathlist) {
    initStorage()

    for (const path of pathlist) {
        fs.stat(path, function (err, data) {
            if (data.isFile() || data.isDirectory()) {
                $`git add ${path}`.quiet()
            } else {
                console.error(`path(${path}) does not exist`)
                return false
            }
        });
    }
    return true
}

// By tag to gitverse code repository, then upload the code repository
export async function UploadGitCodeByTag(tagName) {
    initStorage()

    const tag_file_name = await genGitTagFile(tagName)
    const repo_name = await getGitRepoName()

    // store file(tag_file_name) to cess bucket(repo_name)
    await storage.uploadFileToStorageProvider(repo_name, tag_file_name).then((fid) => {
        $`rm ${tag_file_name}`.quiet()
        ether.uploadGitRepoToContract(repo_name, fid)
        return fid
    })
}

// By commit to gitverse code repository, then upload the code repository
export async function UploadGitCodeByCommitID(comments) {
    initStorage()

    if (comments == "") {
        comments = "add new code"
    }

    const exitCode = await ($`git commit -m ${comments}`.quiet()).exitCode
    if (exitCode > 0) {
        console.log("nothing to commit, working tree clean")
    }

    let tagName = await ($`git rev-parse --short HEAD |xargs echo -n`.quiet())
    tagName = "tag_" + tagName

    await UploadGitCodeByTag(tagName).then((fid) => {
        $`git tag -d ${tagName}`.quiet()
        return fid
    })
}

// Create an archive of gitverse code repository based on a tag
async function genGitTagFile(tag_name) {
    await ($`git tag ${tag_name}`.quiet()).exitCode

    const repo_name = await getGitRepoName()
    const tag_file_name = `${repo_name}-${tag_name}.tar.gz`

    await $`git archive ${tag_name} --format=tar.gz --output ${tag_file_name}`.quiet()

    return tag_file_name
}