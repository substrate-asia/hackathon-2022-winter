package server

import (
	"fmt"
	pb "github.com/hamster-shared/a-line/pkg/grpc/api"
	"io"
	"sync"
)

type AlineGRPCServer struct {
	pb.UnimplementedAlineRPCServer

	mu sync.Mutex // protects routeNotes
}

func (s *AlineGRPCServer) AlineChat(stream pb.AlineRPC_AlineChatServer) error {
	for {
		in, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		t := in.Type
		fmt.Println(t)

		s.mu.Lock()
		//s.routeNotes[key] = append(s.routeNotes[key], in)
		// Note: this copy prevents blocking other clients while serving this one.
		// We don't need to do a deep copy, because elements in the slice are
		// insert-only and never modified.
		//rn := make([]*pb.RouteNote, len(s.routeNotes[key]))
		//copy(rn, s.routeNotes[key])
		s.mu.Unlock()

		execMsg := &pb.AlineMessage{
			Type: 1,
		}

		if err := stream.Send(execMsg); err != nil {
			fmt.Println("send execMsg success")
		}
		//for _, note := range rn {
		//	if err := stream.Send(note); err != nil {
		//		return err
		//	}
		//}
	}
}
