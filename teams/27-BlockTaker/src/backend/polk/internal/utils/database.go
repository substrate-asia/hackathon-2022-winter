package utils

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"polk-p2/define"
	"tools/ilog"
)

type Database struct {
}

func (t *Database) NewDb() {
	db, err := gorm.Open(sqlite.Open("file:"+define.DbPath+"?cache=shared&_busy_timeout=9999999"), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})
	if err != nil {
		ilog.Logger.Panic(err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		ilog.Logger.Panic(err)
	}
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	if err = db.AutoMigrate(&define.ModelNominator{}); err != nil {
		ilog.Logger.Panic(err)
	}

	define.Db = db
}
