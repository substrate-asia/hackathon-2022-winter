
import React, { useEffect, useMemo, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import './App.scss';
import { MainButton } from './component/button';
import { Input } from './component/form';
import { useAlertModal } from './component/modals/AlertModal';
import FeedbackModule from './component/modules/FeedbackModule';
import { useWallet } from './config/redux';
import { testApi } from './config/urls';
import { DaoBasicProfileSettingsPage, DaoHomePage, DaoProposalSettingsPage } from './page/dao';
import RulesDetailsPage from './page/dao/RulesDetailsPage';
import HomePage from './page/HomePage';
import { ProfileEditPage, ProfileHomepage } from './page/profile';
import { ProposalCreatePage, ProposalHomePage } from './page/proposal';

const App = () => {
  const routeParams = useParams()
  const [searchParams, setSearchParams] = useSearchParams();

  const { display: alert } = useAlertModal()

  const [cookies, setCookies] = useCookies(["referral"])

  useEffect(() => {
    if (searchParams.get('referral') && searchParams.get('referral') != cookies.referral) {
      setCookies("referral", searchParams.get('referral'), { path: '/' })
    }
  }, [cookies, searchParams, setCookies])

  useEffect(() => {
    const int = setInterval(() => {
      let ele = (document.getElementsByTagName("onboard-v2")[0] as HTMLElement)
      if (ele) {
        let sr = ele.shadowRoot
        let toaster = sr?.getElementById("account-center-with-notify") as HTMLElement
        if (toaster && toaster.style.display != 'none') {
          toaster.style.display = 'none'
          clearInterval(int)
        }
      }
    }, 100);
  }, [])

  const page = useMemo(() => {
    if (!routeParams.page) {
      return <HomePage />
    } else {
      if (routeParams.page === 'dao') {
        if (routeParams.param1 === 'create') {
          return <DaoBasicProfileSettingsPage />
        } else if (routeParams.param1 === 'settings') {
          if (routeParams.param2 === 'proposal') {
            return <DaoProposalSettingsPage slug={routeParams.param3} />
          } else if (routeParams.param2 === 'basic') {
            return <DaoBasicProfileSettingsPage slug={routeParams.param3} />
          } else {
            return <HomePage />
          }
        } else {
          if (routeParams.param2 === 'propose') {
            return <ProposalCreatePage dao={routeParams.param1} />
          } else if (routeParams.param2 === 'rules') {
            return <RulesDetailsPage slug={routeParams.param1} />
          } else {
            if (!routeParams.param1?.length || routeParams.param1 === 'undefined') {
              return <HomePage />
            } else {
              return <DaoHomePage slug={routeParams.param1} subpage={searchParams.get('subpage')} />
            }
          }
        }
      } else if (routeParams.page === 'proposal') {
        return <ProposalHomePage id={routeParams.param1} />
      } else if (routeParams.page === 'profile') {
        if (routeParams.param1 === 'edit') {
          return <ProfileEditPage slug={routeParams.param2} state={searchParams.get('state')} code={searchParams.get('code')}
            oauth_token={searchParams.get('oauth_token')} oauth_verifier={searchParams.get('oauth_verifier')}
            referral={searchParams.get('referral')} />
        } else {
          return <ProfileHomepage slug={routeParams.param1} subpage={searchParams.get('subpage')}
            state={searchParams.get('state')} code={searchParams.get('code')}
            oauth_token={searchParams.get('oauth_token')} oauth_verifier={searchParams.get('oauth_verifier')} />
        }
      }
    }
    return <HomePage />
  }, [routeParams, searchParams])

  const bgUrl = useMemo(() => {
    if (routeParams.page === 'fifa2') {
      return "https://oss.metopia.xyz/imgs/fifa-bg2.png"
    } else if (!routeParams?.page?.length) {
      return "https://oss.metopia.xyz/imgs/home-top-bg.png"
    }
    return "https://oss.metopia.xyz/imgs/main-bg.png"
  }, [routeParams])

  const [email, setEmail] = useState("")
  const [showFeedbackModule, setShowFeedbackModule] = useState(false)

  const [wallet, connect] = useWallet()

  useEffect(() => {
    let disconnected = localStorage.getItem('disconnect')

    if (!wallet?.address && disconnected != 'true') {
      console.log('connecting')
      connect()
    }

    if (wallet?.address && disconnected == 'true') {
      localStorage.setItem("disconnect", 'false')
    }
  }, [wallet])

  return (
    <div className='bg-wrapper'>
      <img className="main-bg" src={bgUrl} alt="" draggable="false"
        style={
          !routeParams?.page?.length ? { width: '100vw', left: 0, top: 0, position: 'fixed' } :
            (routeParams.page == 'fifa' || routeParams.page == 'fifa2' ? { transform: 'translateY(90px)' } : null)} />
      <div className="app" >
        <div className='container'>
          <div className='body'>
            {page}
          </div>
          <div className='footer' style={routeParams?.param1 === 'create' || routeParams?.param1 === 'settings' ||
            routeParams?.param2 === 'propose' || routeParams?.param2 === 'edit' || routeParams?.param1 === 'edit'
            || routeParams?.param2 === 'createRaffle' || (routeParams.page === 'fifa' && !routeParams?.param1) || routeParams.page === 'fifa2' ?

            { display: 'none' } : null}>
            <div className='container'>
              <div className='left'>
                <img src={"https://oss.metopia.xyz/imgs/metopia-logo.svg"} alt='' className='logo' />
                <div className='text-wrapper'>
                  <div className='text'>Keep in touch with Metopia</div>
                  <div className='functional'>
                    <Input placeholder={'email'} onChange={e => setEmail(e.target.value)} value={email} />
                    <MainButton onClick={e => {
                      fetch(testApi.subscription_create, {
                        method: "post",
                        body: JSON.stringify({ email })
                      }).then(res => res.json()).then(res => {
                        if (res.code == 200) {
                          toast.success('Thank you for subscription', {
                            className: "r-toast",
                            bodyClassName: "r-toast-body",
                            icon: <img src="https://oss.metopia.xyz/imgs/checked.svg" alt="" />
                          })
                          // alert("Thank you for subscription", "", false)
                        } else {
                          alert("Subsciption failed", "Please provide correct email address")
                        }
                      }).catch(e => {
                        alert("Subsciption failed", "Please provide correct email address")
                      })
                    }}>Subscribe</MainButton>
                  </div>
                </div>
              </div>
              <div className='right'>
                <div className='sns-button-wrapper'>
                  <div className='logo-wrapper'
                    title="Document"
                    onClick={() => window.open("https://metopia.gitbook.io/metopia-docs/#what-is-metopia")}>
                    <img src="https://oss.metopia.xyz/imgs/document.svg" className='logo' style={{ height: '18px' }} alt="" />
                  </div>
                  <div className='logo-wrapper'
                    title="Twitter"
                    onClick={() => window.open("https://twitter.com/MetopiaMetopian")}
                  >
                    <img src="https://oss.metopia.xyz/imgs/twitter.svg" className='logo' alt="" />
                  </div><div className='logo-wrapper'
                    title="Discord"
                    onClick={() => window.open("https://discord.com/invite/yTseCeHNEk")}>
                    <img src="https://oss.metopia.xyz/imgs/discord.svg" className='logo' style={{ height: '18px' }} alt="" />
                  </div>
                </div>
                <div className='copyright'>
                  © 2022 Metopia. All rights reserved.<br />
                  We respect your privacy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >

      <img src="https://oss.metopia.xyz/imgs/feedback2.png" className='feedback-trigger' onClick={() => setShowFeedbackModule(true)} title="Feedback" alt="" />
      <FeedbackModule isShow={showFeedbackModule}
        onClose={() => { setShowFeedbackModule(false) }}
        initialStyle={{
          right: '-600px',
          top: '100px'
        }} displayState={{
          right: '32px',
          top: '100px'
        }} />
    </div>
  );
}

export default App;

