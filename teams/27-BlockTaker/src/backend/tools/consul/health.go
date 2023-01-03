package consul

import (
	"context"
	"fmt"
	"google.golang.org/grpc/health/grpc_health_v1"
)

type HealthImpl struct {
	Status grpc_health_v1.HealthCheckResponse_ServingStatus
	Reason string
}

func (h *HealthImpl) Watch(*grpc_health_v1.HealthCheckRequest, grpc_health_v1.Health_WatchServer) error {
	return nil
}

func (h *HealthImpl) OffLine(reason string) {
	h.Status = grpc_health_v1.HealthCheckResponse_NOT_SERVING
	h.Reason = reason
	fmt.Println(reason)
}
func (h *HealthImpl) OnLine(reason string) {
	h.Status = grpc_health_v1.HealthCheckResponse_SERVING
	h.Reason = reason
	fmt.Println(reason)
}

func (h *HealthImpl) Check(ctx context.Context, req *grpc_health_v1.HealthCheckRequest) (*grpc_health_v1.HealthCheckResponse, error) {
	//fmt.Println("当前状态：", h.Status)
	return &grpc_health_v1.HealthCheckResponse{
		Status: h.Status,
	}, nil
}
