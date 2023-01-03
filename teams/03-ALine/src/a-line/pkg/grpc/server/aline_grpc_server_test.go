package server

import (
	"fmt"
	pb "github.com/hamster-shared/a-line/pkg/grpc/api"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"net"
	"testing"
)

func newServer() *AlineGRPCServer {
	return &AlineGRPCServer{}
}

func TestStartServer(t *testing.T) {
	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	pb.RegisterAlineRPCServer(grpcServer, newServer())
	lis, err := net.Listen("tcp", fmt.Sprintf("localhost:%d", 50051))
	if err != nil {
		assert.NoError(t, err)
		return
	}
	grpcServer.Serve(lis)

}
