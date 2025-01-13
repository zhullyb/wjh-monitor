import { ResponseType } from "./types";

export class ApiService {
	private env: Env;

	constructor(env: Env) {
		this.env = env;
	}

	public async login(): Promise<string> {
		const res = await fetch(this.env.WJH_API + "/user/login", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"username": this.env.WJH_ACCOUNT,
				"password": this.env.WJH_PASSWORD
			}),
		});
		const cookie = res.headers.get('Set-Cookie');
		if (cookie) {
			return cookie;
		}
		throw new Error('login failed');
	}

	public async fetchZF(cookie: string): Promise<ResponseType> {
		const res = await fetch(this.env.WJH_API + "/user/bind/zf", {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Cookie': cookie
			},
			body: JSON.stringify({
				password: this.env.ZF_PASSWORD
			})
		});

		return res.json();
	}

	public async notifyFeishu(text: string) {
		await fetch(this.env.FEISHU_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"msg_type": "text",
				"content": {
					"text": text
				}
			})
		})
		.catch(error => console.error('error', error));
	}

	public async logFeishu(text: string) {
		await fetch(this.env.FEISHU_LOG_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"msg_type": "text",
				"content": {
					"text": text
				}
			})
		})
		.catch(error => console.error('error', error));
	}
}

