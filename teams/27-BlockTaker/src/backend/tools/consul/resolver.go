package consul

import (
	"github.com/hashicorp/consul/api"
	"unsafe"
)

type DiscoveryClient interface {
	GetInstances(serviceId string) ([]ServiceInstance, error)
	GetServices() ([]string, error)
}

type consulServiceRegistry struct {
	serviceInstances     map[string]map[string]ServiceInstance
	client               api.Client
	localServiceInstance ServiceInstance
}

// GetInstances 根据服务ID返回IP和端口
func (c *consulServiceRegistry) GetInstances(serviceId string) []ServiceInstance {
	result := make([]ServiceInstance, 0)
	catalogService, _, _ := c.client.Catalog().Service(serviceId, "", nil)
	if len(catalogService) > 0 {
		for _, sever := range catalogService {
			s := DefaultServiceInstance{
				InstanceId: sever.ServiceID,
				ServiceId:  sever.ServiceName,
				Host:       sever.ServiceAddress,
				Port:       sever.ServicePort,
				Metadata:   sever.ServiceMeta,
			}
			result = append(result, s)
		}
	}
	return result
}

// GetServices 返回所有服务名
func (c *consulServiceRegistry) GetServices() []string {
	services, _, _ := c.client.Catalog().Services(nil)
	result := make([]string, unsafe.Sizeof(services))
	index := 0
	for serviceName, _ := range services {
		result[index] = serviceName
		index++
	}
	return result
}

// NewConsulServiceRegistry 实例化注册中心
func NewConsulServiceRegistry(consulAddr, token string) (*consulServiceRegistry, error) {
	config := api.DefaultConfig()
	config.Address = consulAddr
	config.Token = token
	consulClient, err := api.NewClient(config)
	if err != nil {
		return nil, err
	}

	return &consulServiceRegistry{client: *consulClient}, nil
}
