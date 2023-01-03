package service

import (
	"errors"
	"github.com/hamster-shared/a-line/pkg/consts"
	"github.com/hamster-shared/a-line/pkg/logger"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/hamster-shared/a-line/pkg/output"
	"github.com/hamster-shared/a-line/pkg/utils"
	"github.com/hamster-shared/a-line/pkg/utils/platform"
	"github.com/jinzhu/copier"
	"gopkg.in/yaml.v3"
	"io"
	"log"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

type IJobService interface {
	//SaveJob 保存 Job
	SaveJob(name string, yaml string) error

	// GetJob 获取 Job
	GetJob(name string) string

	// GetJobObject get job object
	GetJobObject(name string) *model.Job

	JobList(keyword string, page, size int) *model.JobPage

	//UpdateJob update job
	UpdateJob(oldName string, newName string, yaml string) error

	//DeleteJob delete job
	DeleteJob(name string) error

	// SaveJobDetail 保存 Job 详情
	SaveJobDetail(name string, job *model.JobDetail) error

	UpdateJobDetail(name string, job *model.JobDetail) error

	// GetJobDetail 获取 Job 详情
	GetJobDetail(name string, id int) *model.JobDetail

	//JobDetailList get job detail list
	JobDetailList(name string, page, size int) *model.JobDetailPage

	//DeleteJobDetail delete job detail
	DeleteJobDetail(name string, pipelineDetailId int) error

	//ExecuteJob  exec pipeline job
	ExecuteJob(name string) (*model.JobDetail, error)

	// ReExecuteJob re exec pipeline job
	ReExecuteJob(name string, pipelineDetailId int) error

	// StopJobDetail stop pipeline job
	StopJobDetail(name string, pipelineDetailId int) error

	// GetJobLog 获取 job 日志
	GetJobLog(name string, pipelineDetailId int) *model.JobLog
	// GetJobStageLog 获取 job 的 stage 日志
	GetJobStageLog(name string, pipelineDetailId int, stageName string, start int) *model.JobStageLog

	// OpenArtifactoryDir open artifactory folder
	OpenArtifactoryDir(name string, detailId string) error
	//SaveJobWithFile save pipeline job with template file
	SaveJobWithFile(file, name string)
}

type JobService struct {
}

func NewJobService() *JobService {
	return &JobService{}
}

// SaveJob save pipeline job
func (svc *JobService) SaveJob(name string, yaml string) error {
	//file directory path
	dir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name)
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, name+".yml")
	//determine whether the folder exists, and create it if it does not exist
	_, err := os.Stat(dir)
	if err != nil && os.IsNotExist(err) {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			log.Println("create jobs dir failed", err.Error())
			return err
		}
	} else {
		log.Println("the pipeline job name already exists")
		return errors.New("the pipeline job name already exists")
	}
	//write data to yaml file
	err = os.WriteFile(src, []byte(yaml), 0777)
	if err != nil {
		log.Println("write data to yaml file failed", err)
		return err
	}
	return nil
}

// GetJob get job
func (svc *JobService) GetJob(name string) string {
	//job file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, name+".yml")
	//judge whether the job file exists
	_, err := os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("get job failed,job file not exist", err.Error())
		return ""
	}
	//exist
	fileContent, err := os.ReadFile(src)
	if err != nil {
		log.Println("get job read file failed", err.Error())
		return ""
	}
	return string(fileContent)
}

// UpdateJob update job
func (svc *JobService) UpdateJob(oldName string, newName string, yaml string) error {
	name := oldName
	oldDir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name)
	_, err := os.Stat(oldDir)
	//not exist
	if os.IsNotExist(err) {
		log.Println("update job failed,job file not exist", err.Error())
		return err
	}
	// job file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, name+".yml")
	//judge whether the job detail file exists
	_, err = os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("update job failed,job file not exist", err.Error())
		return err
	}
	if newName != "" {
		newDir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, newName)
		err = os.Rename(oldDir, newDir)
		if err != nil {
			log.Println("reName failed", err.Error())
			return err
		}
		oldSrc := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, newName, name+".yml")
		newSrc := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, newName, newName+".yml")
		err = os.Rename(oldSrc, newSrc)
		if err != nil {
			log.Println("reName failed", err.Error())
			return err
		}
		src = newSrc
		svc.updateJobDetailName(newName)
	}
	//write data to yaml file
	err = os.WriteFile(src, []byte(yaml), 0777)
	if err != nil {
		log.Println("write data to yaml file failed", err)
		return err
	}
	return nil
}

// DeleteJob delete job
func (svc *JobService) DeleteJob(name string) error {
	// job file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name)
	//judge whether the job file exists
	_, err := os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("delete job failed,job file not exist", err.Error())
		return err
	}
	err = os.RemoveAll(src)
	if err != nil {
		log.Println("delete job failed", err.Error())
		return err
	}
	return nil
}

// SaveJobDetail  save job detail
func (svc *JobService) SaveJobDetail(name string, job *model.JobDetail) error {
	job.TriggerMode = consts.TRIGGER_MODE
	// serializes yaml struct
	data, err := yaml.Marshal(job)
	if err != nil {
		log.Println("serializes yaml failed", err)
		return err
	}
	//file directory path
	dir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME)
	//determine whether the folder exists, and create it if it does not exist
	_, err = os.Stat(dir)
	if os.IsNotExist(err) {
		err = os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			log.Println("create job details failed", err.Error())
			return err
		}
	}
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME, strconv.Itoa(job.Id)+".yml")
	//write data to yaml file
	err = os.WriteFile(src, data, 0777)
	if err != nil {
		log.Println("write data to yaml file failed", err)
		return err
	}
	return nil
}

// UpdateJobDetail update job detail
func (svc *JobService) UpdateJobDetail(name string, job *model.JobDetail) error {
	// serializes yaml struct
	data, err := yaml.Marshal(job)
	if err != nil {
		log.Println("serializes yaml failed", err)
		return err
	}
	//file directory path
	dir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME)
	//determine whether the folder exists, and create it if it does not exist
	_, err = os.Stat(dir)
	if os.IsNotExist(err) {
		log.Println("update job detail failed", err.Error())
		return err
	}
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME, strconv.Itoa(job.Id)+".yml")
	//write data to yaml file
	err = os.WriteFile(src, data, 0777)
	if err != nil {
		log.Println("update job detail file failed", err)
		return err
	}
	return nil
}

// GetJobDetail get job detail
func (svc *JobService) GetJobDetail(name string, id int) *model.JobDetail {
	var jobDetailData model.JobDetail
	//job file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME, strconv.Itoa(id)+".yml")
	//judge whether the job detail file exists
	_, err := os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("get job detail failed,job detail file not exist", err.Error())
		return &jobDetailData
	}
	//exist
	fileContent, err := os.ReadFile(src)
	if err != nil {
		log.Println("get job read detail file failed", err.Error())
		return &jobDetailData
	}
	//deserialization job detail yml file
	err = yaml.Unmarshal(fileContent, &jobDetailData)
	if err != nil {
		log.Println("get job,deserialization job detail file failed", err.Error())
		return &jobDetailData
	}

	runningStage := -1
	for index, stage := range jobDetailData.Stages {
		if stage.Status == model.STATUS_RUNNING {
			runningStage = index

		}
	}

	if runningStage >= 0 && runningStage < len(jobDetailData.Stages) {
		jobDetailData.Stages[runningStage].Duration = time.Now().Sub(jobDetailData.Stages[runningStage].StartTime).Milliseconds()
	}
	return &jobDetailData
}

// JobList  job list
func (svc *JobService) JobList(keyword string, page, pageSize int) *model.JobPage {
	var jobPage model.JobPage
	var jobs []model.JobVo
	//jobs folder path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME)
	_, err := os.Stat(src)
	if os.IsNotExist(err) {
		log.Println("jobs folder does not exist", err.Error())
		return &jobPage
	}
	files, err := os.ReadDir(src)
	if err != nil {
		log.Println("failed to read jobs folder", err.Error())
		return &jobPage
	}
	for _, file := range files {
		var ymlPath string
		if keyword != "" {
			if strings.Contains(file.Name(), keyword) {
				//job yml file path
				ymlPath = filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, file.Name(), file.Name()+".yml")
			} else {
				continue
			}
		} else {
			ymlPath = filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, file.Name(), file.Name()+".yml")
		}
		//judge whether the job file exists
		_, err := os.Stat(ymlPath)
		//not exist
		if os.IsNotExist(err) {
			log.Println("job file not exist", err.Error())
			continue
		}
		fileContent, err := os.ReadFile(ymlPath)
		if err != nil {
			log.Println("get job read file failed", err.Error())
			continue
		}
		var jobData model.Job
		var jobVo model.JobVo
		//deserialization job yml file
		err = yaml.Unmarshal(fileContent, &jobData)
		if err != nil {
			log.Println("get job,deserialization job file failed", err.Error())
			continue
		}
		copier.Copy(&jobVo, &jobData)
		svc.getJobInfo(&jobVo)
		createTime := platform.GetFileCreateTime(ymlPath)
		jobVo.CreateTime = *createTime
		jobs = append(jobs, jobVo)
	}
	sort.Sort(model.JobVoTimeDecrement(jobs))
	pageNum, size, start, end := utils.SlicePage(page, pageSize, len(jobs))
	jobPage.Page = pageNum
	jobPage.PageSize = size
	jobPage.Total = len(jobs)
	jobPage.Data = jobs[start:end]
	return &jobPage
}

// JobDetailList job detail list
func (svc *JobService) JobDetailList(name string, page, pageSize int) *model.JobDetailPage {
	var jobDetailPage model.JobDetailPage
	var jobDetails []model.JobDetail
	//get the folder path of job details
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME)
	_, err := os.Stat(src)
	if os.IsNotExist(err) {
		log.Println("job-details folder does not exist", err.Error())
		return &jobDetailPage
	}
	files, err := os.ReadDir(src)
	if err != nil {
		log.Println("failed to read jobs folder", err.Error())
		return &jobDetailPage
	}
	for _, file := range files {
		ymlPath := filepath.Join(src, file.Name())
		//judge whether the job detail file exists
		_, err := os.Stat(ymlPath)
		//not exist
		if os.IsNotExist(err) {
			log.Println("job detail file not exist", err.Error())
			continue
		}
		fileContent, err := os.ReadFile(ymlPath)
		if err != nil {
			log.Println("get job detail read file failed", err.Error())
			continue
		}
		var jobDetailData model.JobDetail
		//deserialization job yml file
		err = yaml.Unmarshal(fileContent, &jobDetailData)
		if err != nil {
			log.Println("get job detail,deserialization job file failed", err.Error())
			continue
		}
		jobDetails = append(jobDetails, jobDetailData)
	}
	sort.Sort(model.JobDetailDecrement(jobDetails))
	pageNum, size, start, end := utils.SlicePage(page, pageSize, len(jobDetails))
	jobDetailPage.Page = pageNum
	jobDetailPage.PageSize = size
	jobDetailPage.Total = len(jobDetails)
	jobDetailPage.Data = jobDetails[start:end]
	return &jobDetailPage
}

// DeleteJobDetail delete job detail
func (svc *JobService) DeleteJobDetail(name string, pipelineDetailId int) error {
	// job detail file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME, strconv.Itoa(pipelineDetailId)+".yml")
	//judge whether the job detail file exists
	_, err := os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("delete job detail failed,job detail file not exist", err.Error())
		return err
	}
	err = os.Remove(src)
	if err != nil {
		log.Println("delete job detail failed", err.Error())
		return err
	}
	return nil
}

// ExecuteJob exec pipeline job
func (svc *JobService) ExecuteJob(name string) (*model.JobDetail, error) {
	//get job data
	jobData := svc.GetJobObject(name)
	//create job detail
	var jobDetail model.JobDetail
	var ids []int
	//job-details file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME)
	//judge whether the job detail file exists
	_, err := os.Stat(src)
	if os.IsNotExist(err) {
		log.Println("job detail file not exist", err.Error())
		err = os.MkdirAll(src, os.ModePerm)
		if err != nil {
			return nil, err
		}
	}
	// read file
	files, err := os.ReadDir(src)
	if err != nil {
		log.Println("read file failed", err.Error())
		return nil, err
	}
	for _, file := range files {
		index := strings.Index(file.Name(), ".")
		id, err := strconv.Atoi(file.Name()[0:index])
		if err != nil {
			log.Println("string to int failed", err.Error())
			continue
		}
		ids = append(ids, id)
	}
	if len(ids) > 0 {
		sort.Sort(sort.Reverse(sort.IntSlice(ids)))
		jobDetail.Id = ids[0] + 1
	}
	stageDetail, err := jobData.StageSort()
	if err != nil {
		return &jobDetail, err
	}
	jobDetail.Job = *jobData
	jobDetail.Status = model.STATUS_NOTRUN
	jobDetail.StartTime = time.Now()
	jobDetail.Stages = stageDetail
	jobDetail.TriggerMode = consts.TRIGGER_MODE
	//TODO... 执行 pipeline job

	//create and save job detail
	return &jobDetail, svc.SaveJobDetail(name, &jobDetail)
}

// ReExecuteJob re exec pipeline job
func (svc *JobService) ReExecuteJob(name string, pipelineDetailId int) error {
	//get job detail data
	jobDetailData := svc.GetJobDetail(name, pipelineDetailId)
	println(jobDetailData)
	//todo 重新执行 pipeline job
	return nil
}

// StopJobDetail stop pipeline job detail
func (svc *JobService) StopJobDetail(name string, pipelineDetailId int) error {
	//get job detail data
	jobDetailData := svc.GetJobDetail(name, pipelineDetailId)
	println(jobDetailData)
	//todo stop pipeline job detail
	return nil
}

// GetJobLog 获取 job 日志
func (svc *JobService) GetJobLog(name string, pipelineDetailId int) *model.JobLog {
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_LOG_DIR_NAME, strconv.Itoa(pipelineDetailId)+".log")

	fileLog, err := output.ParseLogFile(src)
	if err != nil {
		logger.Errorf("parse log file failed, %v", err)
		return nil
	}

	jobLog := &model.JobLog{
		StartTime: fileLog.StartTime,
		Duration:  fileLog.Duration,
		Content:   strings.Join(fileLog.Lines, "\r"),
		LastLine:  len(fileLog.Lines),
	}

	return jobLog
}

// GetJobStageLog 获取 job 的 stage 日志
func (svc *JobService) GetJobStageLog(name string, execId int, stageName string, start int) *model.JobStageLog {
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_LOG_DIR_NAME, strconv.Itoa(execId)+".log")

	fileLog, err := output.ParseLogFile(src)
	if err != nil {
		logger.Errorf("parse log file failed, %v", err)
		return nil
	}

	detail := svc.GetJobDetail(name, execId)

	var stageDetail model.StageDetail

	for _, stage := range detail.Stages {
		if stage.Name == stageName {
			stageDetail = stage
		}
	}

	if &stageDetail == nil {
		return &model.JobStageLog{}
	}

	for _, stage := range fileLog.Stages {
		if stage.Name == stageName {
			var content string
			if start >= 0 && start <= len(stage.Lines) {
				content = strings.Join(stage.Lines[start:], "\r")
			}

			return &model.JobStageLog{
				StartTime: stage.StartTime,
				Duration:  stage.Duration,
				Content:   content,
				LastLine:  len(stage.Lines),
				End:       stageDetail.Status == model.STATUS_SUCCESS || stageDetail.Status == model.STATUS_FAIL,
			}
		}
	}
	return nil
}

func (svc *JobService) getJobInfo(jobData *model.JobVo) {
	//get the folder path of job details
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, jobData.Name, consts.JOB_DETAIL_DIR_NAME)
	_, err := os.Stat(src)
	if os.IsNotExist(err) {
		log.Println("job-details folder does not exist", err.Error())
	}
	files, err := os.ReadDir(src)
	if err != nil {
		log.Println("failed to read jobs folder", err.Error())
	}
	var ids []int
	for _, file := range files {
		index := strings.Index(file.Name(), ".")
		id, err := strconv.Atoi(file.Name()[0:index])
		if err != nil {
			log.Println("string to int failed", err.Error())
			continue
		}
		ids = append(ids, id)
	}
	if len(ids) > 0 {
		sort.Sort(sort.Reverse(sort.IntSlice(ids)))
		jobDetail := svc.GetJobDetail(jobData.Name, ids[0])
		jobData.Duration = jobDetail.Duration
		jobData.Status = jobDetail.Status
		jobData.TriggerMode = jobDetail.TriggerMode
		jobData.StartTime = jobDetail.StartTime
		jobData.TriggerMode = jobDetail.TriggerMode
		jobData.PipelineDetailId = jobDetail.Id
		jobData.Error = jobDetail.Error
	}
}

// GetJob get job
func (svc *JobService) GetJobObject(name string) *model.Job {
	var jobData model.Job
	//job file path
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, name+".yml")
	//judge whether the job file exists
	_, err := os.Stat(src)
	//not exist
	if os.IsNotExist(err) {
		log.Println("get job failed,job file not exist", err.Error())
		return &jobData
	}
	//exist
	fileContent, err := os.ReadFile(src)
	if err != nil {
		log.Println("get job read file failed", err.Error())
		return &jobData
	}
	//deserialization job yml file
	err = yaml.Unmarshal(fileContent, &jobData)
	if err != nil {
		log.Println("get job,deserialization job file failed", err.Error())
		return &jobData
	}
	return &jobData
}

// OpenArtifactoryDir open artifactory folder
func (svc *JobService) OpenArtifactoryDir(name string, detailId string) error {
	artifactoryDir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.ArtifactoryDir, detailId)
	return platform.OpenDir(artifactoryDir)
}

// updateJobDetailName update job detail name
func (svc *JobService) updateJobDetailName(name string) {
	//file directory path
	dir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, consts.JOB_DETAIL_DIR_NAME)
	//determine whether the folder exists, and create it if it does not exist
	_, err := os.Stat(dir)
	if os.IsNotExist(err) {
		logger.Errorf("update job detail name failed:%s", err.Error())
	}
	// read file
	files, err := os.ReadDir(dir)
	if err != nil {
		logger.Errorf("read file failed:%s", err.Error())
	}
	if len(files) > 0 {
		for _, file := range files {
			ymlPath := filepath.Join(dir, file.Name())
			//judge whether the job detail file exists
			_, err := os.Stat(ymlPath)
			//not exist
			if os.IsNotExist(err) {
				log.Println("job detail file not exist", err.Error())
				continue
			}
			fileContent, err := os.ReadFile(ymlPath)
			if err != nil {
				log.Println("get job detail read file failed", err.Error())
				continue
			}
			var jobDetailData model.JobDetail
			//deserialization job yml file
			err = yaml.Unmarshal(fileContent, &jobDetailData)
			if err != nil {
				log.Println("get job detail,deserialization job file failed", err.Error())
				continue
			}
			jobDetailData.Name = name
			svc.UpdateJobDetail(name, &jobDetailData)
		}
	}
}

// SaveJobWithFile save pipeline job with template file
func (svc *JobService) SaveJobWithFile(file, name string) {
	//file directory path
	dir := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name)
	src := filepath.Join(utils.DefaultConfigDir(), consts.JOB_DIR_NAME, name, name+".yml")
	//determine whether the folder exists, and create it if it does not exist
	_, err := os.Stat(dir)
	if err != nil && os.IsNotExist(err) {
		err := os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			log.Println("create jobs dir failed", err.Error())
		}
	} else {
		log.Println("the pipeline job name already exists")
		return
	}
	cicdFile, err := os.Open(path.Join(file))
	defer func() {
		cicdFile.Close()
	}()
	yamlFile, err := io.ReadAll(cicdFile)
	//write data to yaml file
	err = os.WriteFile(src, yamlFile, 0777)
	if err != nil {
		log.Println("write data to yaml file failed", err)
	}
}
