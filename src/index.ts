import { getCurrentTimeStr, isExemptionTime } from "./utils";
import { ApiService } from "./request";
import { DBService } from "./db";

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
  const api = new ApiService(env);
  const db = new DBService(env);
  let success = true;
  const timeStart = new Date();
  try {
    const cookie = await api.login();
    const res = await api.fetchZF(cookie);
    if (res.code !== 1) {
      throw new Error("res.code !== 1");
    }
  } catch (error) {
    console.error(error);
    success = false;
  }
  const timeEnd = new Date();
  const timeDiff = timeEnd.getTime() - timeStart.getTime();

  const db4 = await db.getLatestRecords(4);
  const successCount = db4.results.filter((item) => item.success == true).length + (success ? 1 : 0);
  let onlineStatus = db4.results[0].online_status as boolean;
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
      await api.notifyFeishu("Server is up!");
    } else {
      await api.notifyFeishu("Server is down!");
    }
  }

  await db.insertData(timeDiff, success, onlineStatus, notify, "wjh_zf");
  await db.deleteOldData();

  await api.logFeishu(
    [
      `时间: ${getCurrentTimeStr()}`,
      `请求耗时: ${timeDiff}ms`,
      `请求结果: ${success ? "成功" : "失败"}`,
      `判断在线情况: ${onlineStatus ? "在线" : "离线"}`,
      `是否通知飞书: ${notify ? "通知" : "无需通知"}`
    ].join("\n")
  );
};
