import React from "react";
import { MainButton } from "../../../../../component/button";
import { usePersonalDiscordData } from "../../../../../third-party/discord";
import './index.scss';

const DiscordSubPage = props => {
    const { slug, state, code } = props
    const { data, error } = usePersonalDiscordData(slug, code)

    return <div className="discord-subpage">
        {
            data?.data?.redirect_uri ? <MainButton onClick={e => {
                window.open(data?.data?.redirect_uri)
            }}>Connect to Discord</MainButton> : null
        }{
            data?.data?.discordId ? <div>
                <div className="container">
                    <div className="title">Profile</div>
                    <div style={{ display: "flex", alignItems: 'center', gap: '20px' }}>
                        <div className="avatar-wrapper">
                            <img src={"https://cdn.discordapp.com/avatars/" + data.data.discordId + "/" + data.data.discordAvatar + ".webp"} alt="avatar" />
                        </div>
                        <div>
                            <div className="name">{data.data.discordName}</div>
                            <div>#{data.data.discordDiscrim}</div>
                        </div>
                    </div>
                </div>
                {
                    data.data.accountGuilds.filter(g => g.roles).length ? <div className="guild-detail-container">
                        <div className="title">Guilds</div>
                        <table >
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>My roles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.accountGuilds.filter(g => g.roles).map(g => <tr><td className="name">{g.name}</td><td>{g.roles.map(r => r)}</td></tr>)}
                            </tbody>
                        </table>
                    </div> : null
                }

            </div> : null
        }
        <div></div>
    </div>
}

export default DiscordSubPage