import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { MainButton } from "../../../../component/button";
import { useAlertModal } from "../../../../component/modals/AlertModal";
import { useLoadingModal } from "../../../../component/modals/LoadingModal";
import FixedablePageHead from "../../../../component/modules/FixedablePageHead";
import { useWallet } from "../../../../config/redux";
import { localRouter } from "../../../../config/urls";
import {
  doCreateDaoV2,
  doUpdateDao
} from "../../../../core/dao/daoSetters";
import { DaoSettings } from "../../../../core/dao/type";
import { useDaoById } from "../../../../core/governanceApiHooks";
import { compareIgnoringCase } from "../../../../utils/stringUtils";
import { useScrollTop } from "../../../../utils/useScollTop";
import "./index.scss";
import StartSubpage from "./subpage/CreationSubpage";
import ProfileSubpage from "./subpage/ProfileSubpage";

const DaoBasicProfileSettingsPage = (props) => {
  const { slug } = props;
  const [scrollTop] = useScrollTop();
  const { display: loading, hide: unloading } = useLoadingModal();
  const [data, setData] = useState({
    name: "",
    about: "",
    website: "",
    discord: "",
    twitter: "",
    opensea: "",
    avatar: "",
    banner: "",
    admins: [],
    network: "0",
  });

  const [page, setPage] = useState(1);

  const [wallet, connect] = useWallet()
  const account = useMemo(() => wallet?.address, [wallet])
  const { display: alert } = useAlertModal();

  const { data: daoData } = useDaoById(slug);
  const defaultSettings: DaoSettings = useMemo(
    () => (daoData?.settings ? JSON.parse(daoData.settings) : null),
    [daoData]
  );

  useEffect(() => {
    if (slug) {
      if (defaultSettings) {
        unloading();
        setData({
          name: defaultSettings.name,
          about: defaultSettings.about,
          website: defaultSettings.website,
          discord: defaultSettings.discord,
          twitter: defaultSettings.twitter,
          opensea: defaultSettings.opensea,
          avatar: defaultSettings.avatar,
          banner: defaultSettings.banner,
          admins: defaultSettings.admins,
          network: "-2",
        });
        setPage(2);
      } else {
        loading("Loading settings");
      }
    }
    return unloading;
  }, [slug, defaultSettings]);

  const smartSetData = useCallback(
    (params: Object) => {
      setData(Object.assign({}, data, params));
    },
    [data]
  );

  useEffect(() => {
    if (account?.length && !data?.admins?.find(ad=>ad==account)) {
      let tmp =
        data?.admins?.filter((ad) => !compareIgnoringCase(ad, account)) || [];
      smartSetData({ admins: [account, ...tmp] });
    } else {
      connect().catch((e) => {
        if (e.code != -32002) window.location.href = localRouter("home");
      });
    }
  }, [account, data?.admins]);

  useEffect(() => {
    if (page === 2) {
      setTimeout(() => {
        document.getElementById(
          "daoBasicProfileSettingsBodyContainer"
        ).style.transition = "0ms";
      }, 300);
    }

    return () => {
      document.getElementById(
        "daoBasicProfileSettingsBodyContainer"
      ).style.transition = "300ms";
    };
  }, [page]);

  const height = useMemo(() => {
    return page === 1 ? "400px" : "auto";
  }, [page]);

  return (
    <div className="dao-basic-profile-settings-page">
      <FixedablePageHead
        backLink={localRouter("dao", { dao: slug })}
        setPage={setPage}
        page={page}
        title={"Create a Space on Metopia"}
        onBack={() => {
          if (page === 1 || slug) {
            window.location.href = slug?.length
              ? localRouter("dao", { dao: slug })
              : localRouter("home");
          } else {
            document.getElementById(
              "daoBasicProfileSettingsBodyContainer"
            ).style.transition = "300ms";
            smartSetData({
              name: "",
              about: "",
              website: "",
              discord: "",
              twitter: "",
              opensea: "",
              avatar: "",
              banner: "",
            });
            setPage(1);
          }
        }}
        steps={[
          { text: "Start", state: page },
          { text: "Set information", state: page - 1 },
        ]}
      />

      <div className={`body page${page}`}>
        <div
          className="container"
          id="daoBasicProfileSettingsBodyContainer"
          style={{ height: height }}
        >
          <div className="subpage-wrapper">
            <StartSubpage
              onSelect={(opt) => {
                setPage((opt || 0) + 2);
              }}
            />
          </div>
          <div className="subpage-wrapper">
            <ProfileSubpage
              value={data}
              onChange={smartSetData}
              scrollTop={scrollTop}
              importFromSnapshot={page === 3}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
      {page >= 2 ? (
        <div className="footer">
          <MainButton
            solid
            disabled={
              !data?.name?.length ||
              !data?.avatar?.length ||
              !data?.admins?.length
            }
            onClick={(e) => {
              if (slug) {
                loading("Please sign the message and update the profile");
              } else {
                loading("Please sign the message and activate the space");
              }
              // checkWallet().then(flag => {
              //     if (!flag)
              //         return
              if (slug) {
                doUpdateDao(slug, Object.assign({}, defaultSettings, data), wallet)
                  .then((res) => {
                    window.location.href =
                      localRouter("dao.prefix") + res.content;
                  })
                  .catch((e) => {
                    if (e !== "signature failed") {
                      alert("Failed");
                    }
                  })
                  .finally(unloading);
              } else {
                return doCreateDaoV2(Object.assign({}, data), wallet)
                  .then((res) => {
                    window.location.href =
                      localRouter("dao.prefix") + res.content
                  })
                  .catch((e) => {
                    if (e !== "signature failed") alert("Dao creation Failed");
                  })
                  .finally(unloading);
              }
              // })
            }}
          >
            {slug ? "Update Profile" : "Start your journey"}
          </MainButton>
        </div>
      ) : null}
    </div>
  );
};

export default DaoBasicProfileSettingsPage;
