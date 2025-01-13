import { getCurrentTimeStr, isExemptionTime } from "./utils";
import { ApiService } from "./request";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    ctx.waitUntil(main(env));
    return new Response("Hello World!");
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(main(env));
  }
} satisfies ExportedHandler<Env>;

const main = async (env: Env) => {
  const apiService = new ApiService(env);
  let success = true;
  const timeStart = new Date();
  try {
    const cookie = await apiService.login();
    const res = await apiService.fetchZF(cookie);
    if (res.code !== 1) {
      throw new Error("res.code !== 1");
    }
  } catch (error) {
    console.error(error);
    success = false;
  }
  const timeEnd = new Date();
  const timeDiff = timeEnd.getTime() - timeStart.getTime();

  const db4 = await env.DB.prepare("SELECT * FROM DATA ORDER BY check_time DESC LIMIT 4").bind().run();
  const successCount = db4.results.filter((item) => item.success == true).length + (success ? 1 : 0);
  let onlineStatus = db4.results[0].online_status;
  let notify = false;

  if (!isExemptionTime()) {
    if (onlineStatus) {
      if (successCount <= 2) {
        onlineStatus = false;
        notify = true;
      }
    } else {
      if (successCount >= 3) {
        onlineStatus = true;
        notify = true;
      }
    }
  }

  if (notify) {
    if (onlineStatus) {
      await apiService.notifyFeishu("Server is up!");
    } else {
      await apiService.notifyFeishu("Server is down!");
    }
  }

  await env.DB.prepare("INSERT INTO DATA (response_time, success, online_status, notify) VALUES (?, ?, ?, ?)")
    .bind(timeDiff, success, onlineStatus, notify)
    .run();

  await apiService.logFeishu(
    [
      `时间: ${getCurrentTimeStr()}`,
      `请求耗时: ${timeDiff}ms`,
      `请求结果: ${success ? "成功" : "失败"}`,
      `判断在线情况: ${onlineStatus ? "在线" : "离线"}`,
      `是否通知飞书: ${notify ? "通知" : "无需通知"}`
    ].join("\n")
  );
};
