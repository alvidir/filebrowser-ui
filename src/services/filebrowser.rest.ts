import Profile from "vue-menus/src/profile";
import urlJoin from "url-join";

type Headers = { [key: string]: string };

class FilebrowserClient {
  url: string;
  headers: Headers;

  constructor(url: string, headers: Headers) {
    this.url = url;
    this.headers = headers;
  }

  getProfile = async (): Promise<Profile> => {
    const profileUri = urlJoin(this.url, "profile");
    return fetch(profileUri).then((data) =>
      Object.assign(new Profile("", ""), data)
    );
  };
}

export default FilebrowserClient;
