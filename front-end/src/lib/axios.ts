import axios from 'axios'

export const host = `http://${process.env.NEXT_PUBLIC_API_HOST}`;
export const wss_host = `ws://${process.env.NEXT_PUBLIC_API_HOST}`;

export function get(url: string, options?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios
      .get(`${host}${url}`, {
        ...options,
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json',
        }
      })
      .then((res) => {
        resolve(res.data.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}


export function put(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios
      .put(`${host}${url}`, data, {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json',
        }
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function post(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.post(`${host}${url}`, data, {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json',
      }
    }).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      reject(err)
    })
  })
}

export function del(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(`${host}${url}`, {
      data: data,
      timeout: 3000,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      });
  });
}
export function postFormData(url: string, data: FormData): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.post(`${host}${url}`, data, {
      timeout: 3000,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
        'Content-Type': 'multipart/form-data',
      }
    })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export function putFormData(url: string, data: FormData): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.put(`${host}${url}`, data, {
      timeout: 3000,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('jwt')}`,
        'Content-Type': 'multipart/form-data',
      }
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  })
}