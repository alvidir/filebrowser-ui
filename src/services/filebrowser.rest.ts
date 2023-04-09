import Profile from "vue-menus/src/profile";

type Headers = { [key: string]: string };

class FilebrowserClient {
  url: string;
  headers: Headers;

  constructor(url: string, headers: Headers) {
    this.url = url;
    this.headers = headers;
  }

  getProfile = async (): Promise<Profile> => {
    return fetch(this.url).then((data) =>
      Object.assign(new Profile("", ""), data)
    );
  };
}

export default FilebrowserClient;
