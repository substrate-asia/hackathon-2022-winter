package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"qv.od/internal/external_apis/cess_rpc_api"
)

const CessRpcApi = "wss://testnet-rpc0.cess.cloud/ws/"

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}

func main() {
	if len(os.Args) < 2 {
		fmt.Printf("Usage: %s <cmd> <args>", os.Args[0])
		os.Exit(1)
	}

	mnemonicWord := flag.String("mnemonicWord", os.Getenv("MNEMONIC_WORD"), "mnemonic word for the account")

	createBktCmd := flag.NewFlagSet("createBucket", flag.ExitOnError)
	createBktName := createBktCmd.String("name", "", "bucket name")

	listBktsCmd := flag.NewFlagSet("listBuckets", flag.ExitOnError)

	showBktCmd := flag.NewFlagSet("showBucket", flag.ExitOnError)
	showBktName := showBktCmd.String("name", "", "bucket name")

	deleteBktCmd := flag.NewFlagSet("deleteBucket", flag.ExitOnError)
	deleteBktName := deleteBktCmd.String("name", "", "bucket name")

	uploadCmd := flag.NewFlagSet("upload", flag.ExitOnError)
	uploadBktName := uploadCmd.String("bkt", "", "bucket name")
	uploadFile := uploadCmd.String("file", "", "file path")

	readCmd := flag.NewFlagSet("read", flag.ExitOnError)
	readFileId := readCmd.String("fileId", "", "file id")

	deleteCmd := flag.NewFlagSet("delete", flag.ExitOnError)
	deleteFileId := deleteCmd.String("fileId", "", "file id")

	flag.Parse()

	cessApi := cess_rpc_api.CessRpcApi{RpcUrl: CessRpcApi}

	args := flag.Args()
	switch args[0] {
	case "createBucket":
		err := createBktCmd.Parse(args[1:])
		checkErr(err)
		log.Println("Create bucket")
		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		err = cessApi.CreateBucket(*createBktName)
		checkErr(err)
	case "listBuckets":
		err := listBktsCmd.Parse(args[1:])
		checkErr(err)
		log.Println("List buckets")
		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		bktList, err := cessApi.GetBucketList()
		checkErr(err)

		fmt.Print(bktList)

	case "showBucket":
		err := showBktCmd.Parse(args[1:])
		checkErr(err)

		log.Printf("Show bucket: %s\n", *showBktName)
		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		bktInfo, err := cessApi.GetBucketInfo(*showBktName)
		checkErr(err)

		log.Printf("total file size: %d", len(bktInfo.FileList))
		for _, fid := range bktInfo.FileList {
			fileMetaInfo, err := cessApi.GetFileMetaInfo(fid)
			checkErr(err)

			log.Printf("file meta info: %+v", fileMetaInfo)
		}

	case "deleteBucket":
		err := deleteBktCmd.Parse(args[1:])
		checkErr(err)

		log.Printf("Deleting bucket: %s\n", *deleteBktName)
		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		err = cessApi.DeleteBucket(*deleteBktName)
		checkErr(err)

	case "upload":
		err := uploadCmd.Parse(args[1:])
		checkErr(err)

		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		log.Printf("Upload file %s to bucket: %s\n", *uploadFile, *uploadBktName)

		fp, err := os.Open(*uploadFile)
		checkErr(err)
		fid, err := cessApi.UploadFile(*uploadBktName, fp)
		checkErr(err)
		log.Printf("fid: %s\n", fid)

	case "read":
		err := readCmd.Parse(args[1:])
		checkErr(err)

		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		log.Printf("Read file id: %s", *readFileId)

		fileContent, err := cessApi.GetFileByFid(*readFileId)
		checkErr(err)
		log.Printf("Read file Content: %s\n", string(fileContent))

	case "delete":
		err := deleteCmd.Parse(args[1:])
		checkErr(err)

		err = cessApi.Init(*mnemonicWord)
		checkErr(err)

		log.Printf("Delete file id: %s", *deleteFileId)

		txHash, err := cessApi.DeleteFile(*deleteFileId)
		checkErr(err)
		log.Printf("Delete file txHash: %s\n", txHash)
	}
}
