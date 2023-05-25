import { Profile } from "vue-profile/src/profile";
import config from "@/config.json";
import urlJoin from "url-join";

const url = urlJoin(config.FILEBROWSER_BASE_URI, "rest");

const requestInit: RequestInit = {};
if (process.env.NODE_ENV === "development") {
  requestInit.headers = {
    "X-Uid": "1",
  };
}

const getProfile = async (): Promise<Profile> => {
  const profileUri = urlJoin(url, "profile");
  return fetch(profileUri, requestInit)
    .then((response) => response.json())
    .then((data) => {
      return Object.assign({}, data);
    });
};

export { getProfile };
