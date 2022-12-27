package client

import (
	"context"
	pb "github.com/hamster-shared/a-line/pkg/grpc/api"
	"io"
	"log"
	"time"
)

func runChat(client pb.AlineRPCClient) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	stream, err := client.AlineChat(ctx)
	if err != nil {
		log.Fatalf("client.RouteChat failed: %v", err)
	}
	waitc := make(chan struct{})
	go func() {
		for {
			in, err := stream.Recv()
			if err == io.EOF {
				// read done.
				close(waitc)
				return
			}
			if err != nil {
				log.Fatalf("client.RouteChat failed: %v", err)
			}
			log.Printf("Got message %s at point(%d, %d)", in.String(), in.Type, in.GetType())
		}
	}()

	notes := []pb.AlineMessage{
		pb.AlineMessage{
			Type: 1,
		},
	}

	for _, note := range notes {
		if err := stream.Send(&note); err != nil {
			log.Fatalf("client.RouteChat: stream.Send(%v) failed: %v", note, err)
		}
	}
	stream.CloseSend()
	<-waitc
}
