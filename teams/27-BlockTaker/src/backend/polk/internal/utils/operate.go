package utils

import (
	"fmt"
	"github.com/golang-module/carbon"
	"polk-p2/define"
	"sort"
	"strconv"
	"strings"
	"sync"
	"tools/ihelp"
	"tools/ilog"
)

type Operate struct {
	subscan SubScan
}

// 根据提名者账户反推对应的活跃验证者的地址和提名者对应排名
// 如果提名者对于该验证者排名大于256名，则计算出第256位提名者的质押数量
func (t *Operate) MyNominator(stash string) (tarAddress string, nmRank int, nm256Bonded float64) {
	var data define.ModelNominator
	if err := define.Db.Where("stash_address = ?", stash).Find(&data).Error; err != nil {
		ilog.Logger.Error(err)
		return
	}

	vnMap := make(map[string]int) //验证者地址:提名数量
	vnMapLock := sync.Mutex{}     //并发锁
	validators := strings.Split(data.ValidatorAddress, ",")

	wg := sync.WaitGroup{}
	wg.Add(len(validators))

	for _, address := range validators {
		go func(address string) {
			defer ihelp.ErrCatch()
			defer wg.Done()
			validator, err := t.subscan.GetValidatorInfo(address)
			if err != nil {
				ilog.Logger.Error(address, err)
				return
			}
			vnMapLock.Lock()
			vnMap[address] = validator.CountNominators
			vnMapLock.Unlock()
		}(address)
	}
	wg.Wait()

	//遍历vnMap通过提名者数量计算出每个验证者需要请求几次接口
	for valiAddr, count := range vnMap {
		cut := 100
		index := count / cut
		if count%cut > 0 {
			index++
		}

		var over bool //是否终止

		wg = sync.WaitGroup{}
		wg.Add(index)

		for i := 0; i < index; i++ {
			go func(page int) {
				defer ihelp.ErrCatch()
				defer wg.Done()
				nominators, err := t.subscan.GetNominators(valiAddr, page, cut)
				if err != nil {
					ilog.Logger.Error(err)
					return
				}
				for _, n := range nominators {
					if n.RankNominator == 256 {
						bonded, _ := strconv.ParseFloat(n.Bonded, 64)
						nm256Bonded = ihelp.Decimal(bonded / float64(define.DotScale))
					}
					if n.NominatorStash == stash {
						tarAddress = valiAddr
						nmRank = n.RankNominator
						over = true
						return
					}
				}
			}(i)
		}

		wg.Wait()

		if over {
			return
		}
	}
	return
}

// 读取验证者排行榜
func (t *Operate) ValidatorRank(balance float64) ([]define.CustomValidator, error) {
	//读取基础验证者
	vlist, err := t.subscan.GetValidatorsV1()
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	//第一次处理得到每个验证者的收益情况，前10条收益/天数 = 日均收益
	//日平局收益 = 验证者资金账号:收益
	avgReward := make(map[string]float64)
	avgLock := sync.Mutex{}
	wg := sync.WaitGroup{}
	wg.Add(len(vlist))
	for _, v := range vlist {
		go func(item define.PolkValidatorItem) {
			defer ihelp.ErrCatch()
			defer wg.Done()

			var limit = 10
			var rows []define.PolkRewardItem
			rows, err = t.subscan.GetRewardInfo(item.StashAccountDisplay.Address, 0, limit)
			if err != nil {
				ilog.Logger.Error(err)
				return
			}

			if len(rows) != limit {
				return
			}

			var amount float64
			for _, reward := range rows {
				numAmount, _ := strconv.ParseFloat(reward.Amount, 64)
				amount += numAmount
			}
			amount = ihelp.Decimal(amount / float64(define.DotScale))
			diffDay := carbon.CreateFromTimestamp(int64(rows[9].BlockTimestamp)).DiffAbsInDays(carbon.Now())
			avg := ihelp.Decimal(amount / float64(diffDay))
			avgLock.Lock()
			avgReward[item.StashAccountDisplay.Address] = avg
			avgLock.Unlock()
		}(v)
	}
	wg.Wait()

	//第二次处理数据,收益算法
	//日均收益/佣金比例-日均收益 = 日均提名者蛋糕
	result := make([]define.CustomValidator, 0)
	for _, v := range vlist {
		if _, ok := avgReward[v.StashAccountDisplay.Address]; !ok {
			continue
		}

		item := define.CustomValidator{}
		//总质押
		bondedTotalNum, _ := strconv.ParseFloat(v.BondedTotal, 64)
		bondedTotal := fmt.Sprintf("%.4f", bondedTotalNum/float64(define.DotScale))
		//佣金
		var validatorPrefsValue float64
		if v.ValidatorPrefsValue == 1 {
			validatorPrefsValue = 0
		} else {
			validatorPrefsValue = float64(v.ValidatorPrefsValue) / float64(10000000)
		}

		item.Identity = true
		item.BondedTotal = bondedTotal
		item.Address = v.StashAccountDisplay.Address
		item.ValidatorPrefsValue = fmt.Sprintf("%.2f", validatorPrefsValue)
		item.CountNominators = v.CountNominators
		item.RewardPoint = v.RewardPoint

		//质押比例
		bondedTotalNum, _ = strconv.ParseFloat(bondedTotal, 64)
		scale := ihelp.Decimal(balance / bondedTotalNum)
		if validatorPrefsValue == 0 {
			item.Reward = ihelp.Decimal(avgReward[v.StashAccountDisplay.Address] * scale)
		} else {
			item.Reward = ihelp.Decimal((avgReward[v.StashAccountDisplay.Address]/(validatorPrefsValue/float64(100)) - avgReward[v.StashAccountDisplay.Address]) * scale)
		}

		result = append(result, item)
	}

	//收益排行
	sort.SliceStable(result, func(i, j int) bool {
		return result[i].Reward > result[j].Reward
	})

	//取前16名
	rowLen := len(result)
	if rowLen > 16 {
		rowLen = 16
	}
	cutList := result[:rowLen]
	cutLock := sync.Mutex{}

	//找出大于256位提名者的验证者，给出质押建议
	nmCount := 0
	for _, v := range cutList {
		if v.CountNominators > define.NominatorMax {
			nmCount++
		}
	}

	//如果前16名中提名者数量大于256位则算出第256位的质押数量
	if nmCount > 0 {
		wg = sync.WaitGroup{}
		wg.Add(nmCount)
		for i, v := range cutList {
			if v.CountNominators <= define.NominatorMax {
				continue
			}
			go func(i int, v define.CustomValidator) {
				defer ihelp.ErrCatch()
				defer wg.Done()

				var nominators []define.PolkNominatorItem
				nominators, err = t.subscan.GetNominators(v.Address, define.NominatorMax-2, 1)
				if err != nil {
					ilog.Logger.Error(err)
					return
				}
				if len(nominators) == 0 {
					return
				}
				bonded, _ := strconv.ParseFloat(nominators[0].Bonded, 64)
				bonded = ihelp.Decimal(bonded / float64(define.DotScale))
				cutLock.Lock()
				cutList[i].NominatorsMin = bonded
				cutLock.Unlock()
			}(i, v)
		}
		wg.Wait()
	}

	return cutList, nil
}
