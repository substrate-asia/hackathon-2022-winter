package ips

import (
	"net"
)

func LocalIP() ([]string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return nil, err
	}
	ipArr := make([]string, 0)
	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				ipArr = append(ipArr, ipnet.IP.String())
			}
		}
	}
	return ipArr, nil
}

func GetLocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}
	for _, address := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
}

// GetMac 读取mac地址
func GetMac() (string, error) {
	// 获取本机的MAC地址
	interfaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	var mac string
	for _, netInterface := range interfaces {
		if netInterface.Name == "ent0" || netInterface.Name == "en0" || netInterface.Name == "et0" || netInterface.Name == "eth0" {
			mac = netInterface.HardwareAddr.String()
			break
		}
	}
	return mac, nil
}
