package service

import (
	"embed"
	"fmt"
	"github.com/hamster-shared/a-line/pkg/consts"
	"github.com/hamster-shared/a-line/pkg/model"
	"github.com/jinzhu/copier"
	"gopkg.in/yaml.v2"
	"log"
	"path/filepath"
	"strings"
)

const (
	// TemplateDesPath template description path
	TemplateDesPath = "template/des"

	//TemplatePath  templates path
	TemplatePath = "template/templates"
)

//go:embed template/des
var TemplateDes embed.FS

//go:embed template/templates
var TemplateDir embed.FS

type ITemplateService interface {
	//GetTemplates get template list
	GetTemplates(lang string) *[]model.Template

	//GetTemplateDetail  get template detail
	GetTemplateDetail(id int) (*model.TemplateDetail, error)
}

type TemplateService struct {
}

func NewTemplateService() *TemplateService {
	return &TemplateService{}
}

// GetTemplates get template list
func (t *TemplateService) GetTemplates(lang string) *[]model.Template {
	var list []model.Template
	files, err := TemplateDes.ReadDir(TemplateDesPath)
	if err != nil {
		log.Println("read template des dir failed ", err.Error())
		return &list
	}
	for _, file := range files {
		var templateData model.Template
		desPath := filepath.Join(TemplateDesPath, file.Name())
		fileContent, err := TemplateDes.ReadFile(desPath)
		if err != nil {
			log.Println("get templates failed", err.Error())
			continue
		}
		if consts.LANG_EN == lang {
			var template model.TemplateEnglish
			err = yaml.Unmarshal(fileContent, &template)
			if err != nil {
				log.Println("get templates failed", err.Error())
				continue
			}
			copier.Copy(&templateData, &template)
			templateData.Description = template.DescriptionEnglish
		}
		if consts.LANG_ZH == lang {
			var template model.TemplateChinese
			err = yaml.Unmarshal(fileContent, &template)
			if err != nil {
				log.Println("get templates failed", err.Error())
				continue
			}
			copier.Copy(&templateData, &template)
			templateData.Description = template.DescriptionChinese
		}

		list = append(list, templateData)
	}
	return &list
}

// GetTemplateDetail get template detail
func (t *TemplateService) GetTemplateDetail(id int) (*model.TemplateDetail, error) {
	var detailData model.TemplateDetail
	//template description path
	files, err := TemplateDes.ReadDir(TemplateDesPath)
	if err != nil {
		log.Println("get template detail failed ", err.Error())
		return &detailData, err
	}
	//get template file name
	for _, file := range files {
		var templateData model.TemplateVo
		desPath := filepath.Join(TemplateDesPath, file.Name())
		fileContent, err := TemplateDes.ReadFile(desPath)
		if err != nil {
			log.Println("get templates failed", err.Error())
			continue
		}
		err = yaml.Unmarshal(fileContent, &templateData)
		if err != nil {
			log.Println("get templates failed", err.Error())
			continue
		}
		// Determine if it starts with id_
		if strings.HasPrefix(file.Name(), fmt.Sprintf("%d_", id)) {
			copier.Copy(&detailData, &templateData)
			templatePath := filepath.Join(TemplatePath, templateData.Template)
			templateContent, err := TemplateDir.ReadFile(templatePath)
			if err != nil {
				log.Println("get templates yaml content failed", err.Error())
				break
			}
			detailData.Yaml = string(templateContent)
			break
		}
	}
	return &detailData, err
}
