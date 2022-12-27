import React, { useEffect, useState } from 'react';
import Switch from "react-switch";
import { FormGroup, Input, Label, NumberInput, Select, SelectWithKeywordInput } from '../../../../../component/form';
import SettingsOption from '../../../../../component/SettingsOption';
import UserInput from '../../../../../component/form/UserInput';
import './ProposalAuthenticationSubpage.scss';
import { useGuildsData, useRolesData } from '../../../../../third-party/discord';

const OptionSwitcher = (props: { onChange, checked, className }) => {
    const { onChange, checked, className } = props
    return <Switch
        width={40}
        height={20}
        handleDiameter={16}
        onChange={onChange} checked={checked}
        className={"react-switch " + className}
    />
}
const ProposalAuthenticationSubpage = props => {
    const { slug, data, setData, page } = props
    const [selectedGuildId, setSelectedGuildId] = useState(null)
    const { data: guildsData } = useGuildsData()
    const { data: rolesData } = useRolesData(selectedGuildId)

    const setLoyal = (minScore) => {
        setData({ filters: Object.assign({}, data.filters, { minScore }) })
    }

    const addLoyal = () => {
        setData({ filters: Object.assign({}, data.filters, { onlyMembers: false, minScore: 1 }) })
    }

    const removeLoyal = () => {
        setData({ filters: Object.assign({}, data.filters, { onlyMembers: false, minScore: -1 }) })
    }

    const addAssigned = () => {
        setData({ members: [''] })
    }

    const removeAssigned = () => {
        setData({ members: null })
    }

    const addDiscordRole = () => {
        setData({
            validation: {
                name: "discord", params: { guildId: '', roles: [] }
            }
        })
    }

    const removeDiscordRole = () => {
        setData({
            validation: {
                name: "basic", params: {}
            }
        })
    }
    const isLoyal = !data.filters.onlyMembers && data.filters.minScore > 0
    const isAssigned = data.members?.length > 0
    const isDiscord = data?.validation.name === 'discord'

    return <div className='proposal-authentication-subpage'>
        <div className='title'>Who will be able to write a proposal</div>
        <div className='container' style={page === 2 ? null : { display: 'none' }}>
            <SettingsOption title={'Import Discord roles'}
                subtitle={'You need to define the empowered Discord roles'}
                onActive={addDiscordRole} onDeactive={removeDiscordRole}
                defaultHeight={200} expand={isDiscord}
            >
                <>
                    <Label>
                        <a href="https://discord.com/oauth2/authorize?client_id=971716386877480960&scope=bot&permissions=268436480" target="_blank" rel="noreferrer">
                            Cannot find your guild? Add Metopia bot to your guild.
                        </a>
                    </Label>
                    <FormGroup>
                        <Label>Discord server</Label>
                        <SelectWithKeywordInput options={
                            guildsData?.map(d => {
                                return {
                                    text: d.name, value: d.guildId
                                }
                            })} onChange={e => {
                                setSelectedGuildId(e.value)
                            }} style={{ width: '400px', background: '#1B1E31' }} />
                        {/* <Input placeholder={'Select trait type'} /> */}
                    </FormGroup>
                    {
                        selectedGuildId ?
                            <FormGroup>
                                <Label>Which roles do you want to empower</Label>
                                <SelectWithKeywordInput options={
                                    rolesData?.map(r => {
                                        return {
                                            text: r.name,
                                            value: r.roleId
                                        }
                                    })} onChange={e => {
                                        setData({
                                            validation: {
                                                name: "discord", params: { guildId: selectedGuildId, roles: [e.value] }
                                            }
                                        })
                                    }} style={{ width: '400px', background: '#1B1E31' }} />
                            </FormGroup> : null
                    }
                </>
            </SettingsOption>

            <SettingsOption title={'Loyal members'}
                subtitle={"Authentication based on member's VP"}
                onActive={addLoyal} onDeactive={removeLoyal}
                defaultHeight={150} expand={isLoyal}
            >
                <FormGroup>
                    <Label>Minimum amount of voting power required to create a proposal</Label>
                    <NumberInput value={data.filters.minScore}
                        setValue={val => setLoyal(val)} minValue={1}/>
                </FormGroup>
            </SettingsOption>
            <SettingsOption title={'Assigned members'}
                subtitle={'Specific addresses will be able to create proposals'}
                onActive={addAssigned} onDeactive={removeAssigned}
                defaultHeight={200} expand={isAssigned}
            >
                <FormGroup>
                    <Label>User wallet addresses</Label>
                    {
                        data.members?.map((member, i) => {
                            return <UserInput value={member}
                                key={`UserInput${i}`}
                                onChange={newMember => {
                                    setData({ members: data.members.map((m, j) => i === j ? newMember : m) })
                                }} onAdd={() => {
                                    setData({
                                        members: [...data.members, '']
                                    })
                                }} onDelete={data.members.length > 1 ? () => {
                                    setData({
                                        members: data.members.filter((m, j) => i !== j)
                                    })
                                } : null} />
                        })
                    }
                </FormGroup>
            </SettingsOption>

        </div>
    </div>
}

export default ProposalAuthenticationSubpage