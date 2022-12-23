package iamap

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"tools/icurl"
)

type regeoresp struct {
	Status string `json:"status"`
	Info   string `json:"info"`
	Data   Regeo  `json:"regeocode"`
}

type Regeo struct {
	AddressComponent addressComponent `json:"addressComponent"`
	//FormattedAddress string           `json:"formatted_address"`
}

type addressComponent struct {
	Country      string       `json:"country"`
	Province     string       `json:"province"`
	City         string       `json:"city"`
	District     string       `json:"district"`
	Township     string       `json:"township"`
	Towncode     string       `json:"towncode"`
	Adcode       string       `json:"adcode"`
	Citycode     string       `json:"citycode"`
	StreetNumber streetNumber `json:"streetNumber"`
}

type streetNumber struct {
	Number    string `json:"number"`
	Location  string `json:"location"`
	Direction string `json:"direction"`
	Distance  string `json:"distance"`
	Street    string `json:"street"`
}

// GetGeo 高德地图，逆地理编码
func GetGeo(key string, lng, lat float64) (*Regeo, error) {
	api := fmt.Sprintf("https://restapi.amap.com/v3/geocode/regeo?output=JSON&location=%v,%v&key=%s&radius=1000&extensions=base", lng, lat, key)
	rsp, err := icurl.Get(api, nil)
	if err != nil {
		log.Println("高德接口错误：", err)
		return nil, err
	}

	var res regeoresp
	if err = json.Unmarshal(rsp, &res); err != nil {
		log.Println("高德数据错误：", err)
		return nil, err
	}

	if res.Status == "0" {
		log.Println("高德响应错误：", res.Info)
		return nil, errors.New(res.Info)
	}

	return &res.Data, nil
}
