import { Job, JobBase, QueryBuilder, Schedule } from "@lyra-js/core"

@Job()
export class DeactivateExpiredDiscountCodesJob extends JobBase {
  @Schedule({ recurrency: "0 * * * *", enabled: true })
  async deactivateExpiredDiscountCodes() {
    console.log("[DeactivateExpiredDiscountCodesJob] Running check...")

    const now = new Date()

    const query = new QueryBuilder()
      .selectFrom("discountcode")
      .where("is_active", "=", 1)

    const [rows] = (await query.execute()) as [
      Array<{ id: number; expires_at: string | null; max_uses: number | null; uses_count: number }>
    ]

    console.log(`[DeactivateExpiredDiscountCodesJob] Found ${rows.length} active code(s) to check`)

    for (const row of rows) {
      const isExpired = row.expires_at !== null && new Date(row.expires_at) < now
      const isMaxedOut = row.max_uses !== null && row.uses_count >= row.max_uses

      if (isExpired || isMaxedOut) {
        const entity = await this.discountCodeRepository.find(row.id)
        entity.is_active = 0
        await this.discountCodeRepository.save(entity)
        console.log(`[DeactivateExpiredDiscountCodesJob] Deactivated code id=${row.id}`)
      }
    }
  }
}