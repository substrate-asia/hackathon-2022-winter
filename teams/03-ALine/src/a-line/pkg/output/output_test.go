package output

import (
	"fmt"
	"testing"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/sirupsen/logrus"
)

func TestNew(t *testing.T) {
	logger.Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	testOutput := New("test", 10001)

	testOutput.NewStage("第一阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	testOutput.NewStage("第二阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	testOutput.Done()

	fmt.Println("文件写入到", testOutput.Filename())
}

func TestParseLogFile(t *testing.T) {
	result, err := ParseLogFile("/home/vihv/pipelines/jobs/test/job-details-log/10001.log")
	if err != nil {
		t.Error(err)
	}
	spew.Dump(result)
}

func TestContent(t *testing.T) {
	logger.Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	testOutput := New("test", 10085)

	testOutput.NewStage("第一阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	fmt.Println("读取所有内容：", testOutput.Content())

	testOutput.NewStage("第二阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	fmt.Println("读取新出现的内容：", testOutput.NewContent())

	if len(testOutput.NewContent()) != 0 {
		t.Error("new content length error")
	}

	testOutput.Done()
}

func TestStageOutputList(t *testing.T) {
	logger.Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	testOutput := New("test", 10000)

	testOutput.NewStage("第一阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	testOutput.NewStage("第二阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	if len(testOutput.StageOutputList()) != 2 {
		t.Error("stage output list length error")
	}

	testOutput.Done()
}
func TestTimeInfo(t *testing.T) {
	logger.Init().ToStdoutAndFile().SetLevel(logrus.TraceLevel)
	testOutput := New("test", 10085)

	testOutput.NewStage("第一阶段")
	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	fmt.Println("第一阶段的时间信息：", testOutput.stageTimeConsuming["第一阶段"])

	time.Sleep(1 * time.Second)
	testOutput.NewStage("第二阶段")

	fmt.Println("当有了新阶段后，第一阶段的时间信息：", testOutput.stageTimeConsuming["第一阶段"])

	testOutput.WriteLine("第一行")
	testOutput.WriteLine("第二行")
	testOutput.WriteLine("第三行")
	testOutput.WriteLine("第四行")
	testOutput.WriteLine("第五行")

	fmt.Println("第二阶段的时间信息：", testOutput.stageTimeConsuming["第二阶段"])

	testOutput.Done()

	fmt.Println("整个的时间信息：", testOutput.timeConsuming)
	fmt.Println("整个结束后，第二阶段的时间信息：", testOutput.stageTimeConsuming["第二阶段"])

	fmt.Println("不存在的阶段的时间信息：", testOutput.stageTimeConsuming["不存在的阶段"])

	// 单独查看耗时
	fmt.Println("第一阶段的耗时：", testOutput.StageDuration("第一阶段"))
	fmt.Println("第二阶段的耗时：", testOutput.StageDuration("第二阶段"))
	fmt.Println("不存在的阶段的耗时：", testOutput.StageDuration("不存在的阶段"))

	if testOutput.StageDuration("不存在的阶段") != 0 {
		t.Error("stage duration error")
	}

	if testOutput.StageDuration("第一阶段") == 0 {
		t.Error("stage duration error")
	}

	if testOutput.StageDuration("第二阶段") == 0 {
		t.Error("stage duration error")
	}

	if !testOutput.stageTimeConsuming["第一阶段"].Done {
		t.Error("stage time info done error")
	}
}
