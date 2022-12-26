package helper

import "os"

func GetFile(hash string) ([]byte, error) {

	ossApiHost := os.Getenv("OSS_API_HOST")
	url := ossApiHost + "/api/storage/raw/" + hash

	headers := make(map[string]string)
	res, err := GetWithHeader(url, headers)

	if err != nil {
		return res, err
	}

	return res, nil
}
