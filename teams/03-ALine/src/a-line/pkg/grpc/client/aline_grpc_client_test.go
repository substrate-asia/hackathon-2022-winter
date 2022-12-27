package client

import (
	pb "github.com/hamster-shared/a-line/pkg/grpc/api"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"testing"
)

func TestClient(t *testing.T) {
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithTransportCredentials(insecure.NewCredentials()))
	conn, err := grpc.Dial("127.0.0.1:50051", opts...)
	assert.NoError(t, err)
	client := pb.NewAlineRPCClient(conn)

	runChat(client)
}
