import { Profile } from "vue-profile/src/profile";
import config from "@/config.json";
import urlJoin from "url-join";

const url = urlJoin(config.FILEBROWSER_BASE_URI, "rest");

const getProfile = async (): Promise<Profile> => {
  const profileUri = urlJoin(url, "profile");
  return fetch(profileUri)
    .then((response) => response.json())
    .then((data) => {
      return Object.assign({}, data);
    });
};

export { getProfile };
