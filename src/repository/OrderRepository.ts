import { QueryBuilder, Repository } from "@lyra-js/core"
import { UserOrder } from "@entity/UserOrder"
export class OrderRepository extends Repository<UserOrder> {
  constructor() {
    super(UserOrder)
  }
  async findLastOrderWithDetails(userId: number) {
    const query = new QueryBuilder().raw(
      `SELECT
           o.id AS order_id,
           o.amount,
           o.number as order_number,
           o.created_at,
           od.quantity,
           od.price_each,
           od.gift_voucher_id,
           b.id AS booking_id,
           b.event_id,
           s.duration_minutes,
           a.date,
           a.start_time,
           u.firstname,
           u.lastname,
           u.is_member,
           gv.recipient_name,
           gv.recipient_email,
           gv.qr_code AS gift_voucher_qr_code,
           e.title AS event_title,
           e.date AS event_date,
           e.start_time AS event_start_time,
           e.end_time AS event_end_time
       FROM userorder o
                LEFT JOIN orderdetails od ON od.order_id = o.id
                LEFT JOIN booking b ON od.booking_id = b.id
                LEFT JOIN session s ON od.session_id = s.id
                LEFT JOIN availability a ON b.availability_id = a.id
                LEFT JOIN giftvoucher gv ON gv.id = od.gift_voucher_id
                LEFT JOIN event e ON b.event_id = e.id
                JOIN user u ON o.related_user_id = u.id
       WHERE o.related_user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    )
    const [rows] = await query.execute()
    return rows
  }
}