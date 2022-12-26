package consul

import (
	"fmt"
	"github.com/hashicorp/consul/api"
	"time"
)

// ConsulRegister consul service register
type Register struct {
	ConsulAddr    string        //consul地址
	ConsulToken   string        //consultoken
	SrvName       string        //服务名
	SrvTag        []string      //服务标签
	SrvHost       string        //服务ip
	SrvPort       int           //服务端口
	DisableAfter  time.Duration //服务失败注销时间
	CheckInterval time.Duration //健康监测间隔时间
}

// Register 注册服务
func (r *Register) Register() error {
	config := api.DefaultConfig()
	config.Address = r.ConsulAddr
	config.Token = r.ConsulToken
	client, err := api.NewClient(config)
	if err != nil {
		return err
	}
	agent := client.Agent()

	//IP := LocalIP()
	reg := &api.AgentServiceRegistration{
		ID:      fmt.Sprintf("%v-%v-%v", r.SrvName, r.SrvHost, r.SrvPort), // 服务节点的名称
		Name:    r.SrvName,                                                // 服务名称
		Tags:    r.SrvTag,                                                 // tag，可以为空
		Port:    r.SrvPort,                                                // 服务端口
		Address: r.SrvHost,                                                // 服务 IP
		Check: &api.AgentServiceCheck{ // 健康检查
			Interval:                       r.CheckInterval.String(),                                 // 健康检查间隔
			GRPC:                           fmt.Sprintf("%s:%v/%v", r.SrvHost, r.SrvPort, r.SrvName), // grpc 支持，执行健康检查的地址，service 会传到 Health.Check 函数中
			DeregisterCriticalServiceAfter: r.DisableAfter.String(),                                  // 注销时间，相当于过期时间
		},
	}

	if err = agent.ServiceRegister(reg); err != nil {
		return err
	}

	return nil
}
