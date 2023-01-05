package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"polk-p2/define"
	"strconv"
	"tools/icurl"
	"tools/ihelp"
	"tools/ilog"
)

type SubScan struct {
}

// GetValidators
// 读取所有验证者并完成推荐排序
//func (t *SubScan) GetValidators(balance float64) ([]define.CustomValidator, error) { //查询页数
//	defer ihelp.ErrCatch()
//	//等待从限流桶中取出令牌
//	err := define.Limiter.Wait(context.Background())
//	if err != nil {
//		ilog.Logger.Error(err)
//		return nil, err
//	}
//
//	rows := make([]define.CustomValidator, 0) //结果集
//	url := define.ApiValidatorsUrl
//	header := map[string]string{"X-API-Key": define.ApiSecret}
//	data := map[string]interface{}{
//		`order`:       "asc",
//		`order_field`: "bonded_total",
//		//`row`:         100,
//		//`page`:        0,
//	}
//	body, err := icurl.PostJSON(url, &header, data)
//	if err != nil {
//		ilog.Logger.Error(err)
//		return nil, err
//	}
//
//	var out define.PolkValidatorRes
//	if err = json.Unmarshal(body, &out); err != nil {
//		ilog.Logger.Error(err)
//		return nil, err
//	}
//
//	if len(out.Data.List) > 0 {
//		for _, v := range out.Data.List {
//			validatorPrefsValue := ihelp.Decimal(float64(v.ValidatorPrefsValue) / 10000000)
//			if (v.StashAccountDisplay.Identity == true || v.StashAccountDisplay.Parent.Identity == true) && validatorPrefsValue < 100 {
//				bondedTotal, _ := strconv.ParseFloat(v.BondedTotal, 64)
//				bondedTotal = ihelp.Decimal(bondedTotal / 10000000000)
//
//				item := define.CustomValidator{}
//				item.Identity = true
//				item.BondedTotal = bondedTotal
//				item.Address = v.StashAccountDisplay.Address
//				item.ValidatorPrefsValue = validatorPrefsValue
//				item.CountNominators = v.CountNominators
//				item.RewardPoint = v.RewardPoint
//				item.Reward = ihelp.Decimal(bondedTotal * (1 - item.ValidatorPrefsValue/100))
//				//item.Reward = ihelp.Decimal(balance / (bondedTotal + balance) * (1 - item.ValidatorPrefsValue/100))
//				rows = append(rows, item)
//			}
//		}
//	}
//
//	sort.SliceStable(rows, func(i, j int) bool {
//		return rows[i].Reward > rows[j].Reward
//	})
//
//	rowLen := len(rows)
//	if rowLen > 16 {
//		rowLen = 16
//	}
//	list := rows[:rowLen]
//
//	for i, v := range list {
//		if v.CountNominators >= 256 {
//			nominators, err := t.GetNominators(v.Address, 254, 1)
//			if err != nil {
//				ilog.Logger.Error(err)
//				continue
//			}
//			if len(nominators) == 0 {
//				continue
//			}
//			bonded, _ := strconv.ParseFloat(nominators[0].Bonded, 64)
//			bonded = ihelp.Decimal(bonded / 10000000000)
//			list[i].NominatorsMin = bonded
//		}
//	}
//
//	return list, nil
//}

// 读取佣金小于100%并有绿标的所有验证者
func (t *SubScan) GetValidatorsV1() ([]define.PolkValidatorItem, error) { //查询页数
	defer ihelp.ErrCatch()
	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`order`:       "asc",
		`order_field`: "bonded_total",
		//`row`:         100,
		//`page`:        0,
	}
	body, err := icurl.PostJSON(define.ApiValidatorsUrl, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	var out define.PolkValidatorRes
	if err = json.Unmarshal(body, &out); err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	result := make([]define.PolkValidatorItem, 0)
	for _, v := range out.Data.List {
		if (v.StashAccountDisplay.Identity == true || v.StashAccountDisplay.Parent.Identity == true) && v.ValidatorPrefsValue < 1000000000 {
			result = append(result, v)
		}
	}
	return result, nil
}

// GetNominators
// 读取验证者下所有提名者
func (t *SubScan) GetNominators(validatorAddress string, page, limit int) ([]define.PolkNominatorItem, error) {
	defer ihelp.ErrCatch()

	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	url := define.ApiNominatorsUrl
	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`address`:     validatorAddress,
		`order`:       "asc",
		`order_field`: "rank_nominator",
		`row`:         limit,
		`page`:        page,
	}
	body, err := icurl.PostJSON(url, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	var out define.PolkNominatorRes
	if err = json.Unmarshal(body, &out); err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	return out.Data.List, nil
}

// GetNominatorInfo
// 读取提名者信息
func (t *SubScan) GetNominatorInfo(address string) (define.PolkNominatorInfoData, error) {
	defer ihelp.ErrCatch()

	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkNominatorInfoData{}, err
	}

	url := define.ApiNominatorUrl
	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`address`: address,
	}
	body, err := icurl.PostJSON(url, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkNominatorInfoData{}, err
	}

	var out define.PolkNominatorInfoRes
	if err = json.Unmarshal(body, &out); err != nil {
		ilog.Logger.Error(err)
		return define.PolkNominatorInfoData{}, err
	}

	return out.Data, nil
}

// GetValidatorInfo
// 读取验证者详情
func (t *SubScan) GetValidatorInfo(address string) (define.PolkValidatorInfoDetail, error) {
	defer ihelp.ErrCatch()

	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkValidatorInfoDetail{}, err
	}

	url := define.ApiValidatorUrl
	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`stash`: address,
	}
	body, err := icurl.PostJSON(url, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkValidatorInfoDetail{}, err
	}

	var out define.PolkValidatorInfoRes
	if err = json.Unmarshal(body, &out); err != nil {
		ilog.Logger.Error(err)
		return define.PolkValidatorInfoDetail{}, err
	}

	return out.Data.Info, nil
}

// 读取交易信息
func (t *SubScan) GetTxStatus(txHash string) (define.PolkExtrinsicInfoResData, error) {
	defer ihelp.ErrCatch()

	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkExtrinsicInfoResData{}, err
	}

	url := define.ApiExtrinsicUrl
	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`hash`: txHash,
	}
	body, err := icurl.PostJSON(url, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return define.PolkExtrinsicInfoResData{}, err
	}

	var out define.PolkExtrinsicInfoRes
	if err = json.Unmarshal(body, &out); err != nil {
		ilog.Logger.Error(err)
		return define.PolkExtrinsicInfoResData{}, err
	}
	if out.Code != 0 {
		return define.PolkExtrinsicInfoResData{}, err
	}
	return out.Data, nil
}

// 根据验证者地址读取收益情况
func (t *SubScan) GetRewardInfo(address string, page, limit int) ([]define.PolkRewardItem, error) {
	defer ihelp.ErrCatch()

	//等待从限流桶中取出令牌
	err := define.Limiter.Wait(context.Background())
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	header := map[string]string{"X-API-Key": define.ApiSecret}
	data := map[string]interface{}{
		`address`:  address,
		`row`:      limit,
		`page`:     page,
		`is_stash`: true,
	}
	out, err := icurl.PostJSON(define.ApiRewardUrl, &header, data)
	if err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	var format define.PolkRewardRes
	if err = json.Unmarshal(out, &format); err != nil {
		ilog.Logger.Error(err)
		return nil, err
	}

	return format.Data.List, nil
}

// Decimal 保留两位小数
func (t *SubScan) decimal(value float64) float64 {
	value, _ = strconv.ParseFloat(fmt.Sprintf("%.8f", value), 64)
	return value
}
