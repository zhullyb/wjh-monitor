export class DBService {
  private db: D1Database;

  constructor(env: Env) {
    this.db = env.DB;
  }

  public async getLatestRecords(recordCount: number): Promise<D1Result<Record<string, unknown>>> {
    return await this.db.prepare("SELECT * FROM DATA ORDER BY check_time DESC LIMIT ?").bind(recordCount).run();
  }

  public async insertData(responseTime: number, success: boolean, onlineStatus: boolean, notify: boolean, checkItem: string) {
    await this.db
      .prepare("INSERT INTO DATA (response_time, success, online_status, notify, check_item) VALUES (?, ?, ?, ?, ?)")
      .bind(responseTime, success, onlineStatus, notify, checkItem)
      .run();
  }

  public async deleteOldData() {
    await this.db.prepare("DELETE FROM DATA WHERE check_time < date('now', '-3 days')").run();
  }
}
