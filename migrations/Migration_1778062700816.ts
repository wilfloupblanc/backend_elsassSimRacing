import { MigrationInterface } from "@lyra-js/core"

/**
 * Generated migration: Migration_1778062700816
 * Generated at: 2026-05-06T10:18:20.816Z
 */
export class Migration_1778062700816 implements MigrationInterface {
  readonly version = "1778062700816"
  readonly isDestructive = false
  readonly canRunInParallel = true

  async up(connection: any): Promise<void> {
    await connection.query(`CREATE TABLE IF NOT EXISTS \`availability\` (\`id\` BIGINT AUTO_INCREMENT, \`date\` DATE, \`start_time\` VARCHAR(8), \`slots_total\` TINYINT, \`slots_remaining\` TINYINT, \`is_open\` BOOL, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`booking\` (\`id\` BIGINT AUTO_INCREMENT, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`pilots\` INT, \`price_paid\` FLOAT, \`is_free_session\` BOOL, \`status\` VARCHAR(50), \`cancelled_at\` TIMESTAMP, \`date\` DATE, \`user_id\` BIGINT, \`availability_id\` BIGINT, \`simulator_id\` BIGINT, \`session_id\` BIGINT, \`event_id\` BIGINT, \`gift_voucher_id\` BIGINT, \`checked_in\` BOOL, \`vehicle\` VARCHAR(255), \`checked_in_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`cart\` (\`id\` BIGINT AUTO_INCREMENT, \`user_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`cartitemrecipient\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255), \`cart_item_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`cartitems\` (\`id\` BIGINT AUTO_INCREMENT, \`cart_id\` BIGINT, \`session_id\` BIGINT, \`quantity\` INT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`event\` (\`id\` BIGINT AUTO_INCREMENT, \`title\` VARCHAR(255), \`description\` TEXT, \`date\` DATE, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`simulators_count\` TINYINT, \`pilots_per_simulator\` TINYINT, \`price\` FLOAT, \`vehicles\` TEXT, \`vehicle_categories\` TEXT, \`access\` VARCHAR(50), \`banner_image\` LONGTEXT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`freesessiontoken\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`is_used\` BOOL, \`used_at\` TIMESTAMP, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`giftvoucher\` (\`id\` BIGINT AUTO_INCREMENT, \`recipient_name\` VARCHAR(200), \`recipient_email\` VARCHAR(255), \`qr_code\` VARCHAR(255) UNIQUE, \`status\` VARCHAR(50), \`used_at\` TIMESTAMP, \`stripe_payment_intent_id\` VARCHAR(255), \`amount_paid\` FLOAT, \`expires_at\` TIMESTAMP, \`purchaser_user_id\` BIGINT, \`session_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`orderdetails\` (\`id\` BIGINT AUTO_INCREMENT, \`price_each\` FLOAT, \`session_id\` BIGINT, \`booking_id\` BIGINT, \`gift_voucher_id\` BIGINT, \`quantity\` INT, \`order_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`payments\` (\`id\` BIGINT AUTO_INCREMENT, \`amount\` FLOAT, \`number\` BIGINT, \`related_user_id\` BIGINT, \`order_id\` BIGINT, \`status\` VARCHAR(50), \`stripe_charge_id\` VARCHAR(255), \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`plan\` (\`id\` BIGINT AUTO_INCREMENT, \`plan\` VARCHAR(10) UNIQUE, \`price\` FLOAT, \`stripe_price_id\` VARCHAR(255), PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`scheduleoverride\` (\`id\` BIGINT AUTO_INCREMENT, \`date\` DATE, \`open_time\` TIME, \`close_time\` TIME, \`is_open\` BOOL, \`description\` VARCHAR(80), PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`scheduletemplate\` (\`id\` BIGINT AUTO_INCREMENT, \`day_of_week\` TINYINT, \`open_time\` TIME, \`close_time\` TIME, \`is_open\` BOOL, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`session\` (\`id\` BIGINT AUTO_INCREMENT, \`name\` VARCHAR(100), \`duration_minutes\` TINYINT, \`price_normal\` FLOAT, \`price_member\` FLOAT, \`is_active\` BOOL, \`intro\` TEXT, \`details\` TEXT, \`total_duration\` VARCHAR(50), \`tagline\` TEXT, \`level\` VARCHAR(50), \`image\` VARCHAR(255), \`min_age\` TINYINT, \`min_height\` VARCHAR(20), \`min_pilots\` TINYINT, \`max_pilots\` TINYINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`simulator\` (\`id\` BIGINT AUTO_INCREMENT, \`name\` VARCHAR(100), \`is_active\` BOOL, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`subscription\` (\`id\` BIGINT AUTO_INCREMENT, \`stripe_subscription_id\` VARCHAR(255) UNIQUE, \`plan\` VARCHAR(10), \`pending_plan\` VARCHAR(10), \`price\` FLOAT, \`status\` VARCHAR(50), \`current_period_start\` TIMESTAMP, \`current_period_end\` TIMESTAMP, \`free_sessions_remaining\` INT, \`user_id\` BIGINT, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`user\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255) UNIQUE, \`password\` VARCHAR(255), \`role\` VARCHAR(255), \`is_member\` BOOL, \`stripe_customer_id\` VARCHAR(255), \`created_at\` TIMESTAMP, \`updated_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`CREATE TABLE IF NOT EXISTS \`userorder\` (\`id\` BIGINT AUTO_INCREMENT, \`number\` BIGINT, \`related_user_id\` BIGINT, \`amount\` FLOAT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_user_id\` (\`user_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_availability_id\` (\`availability_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_simulator_id\` (\`simulator_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_session_id\` (\`session_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_event_id\` (\`event_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD INDEX \`fk_booking_gift_voucher_id\` (\`gift_voucher_id\`)`)
    await connection.query(`ALTER TABLE \`cart\` ADD INDEX \`fk_cart_user_id\` (\`user_id\`)`)
    await connection.query(`ALTER TABLE \`cartitemrecipient\` ADD INDEX \`fk_cartitemrecipient_cart_item_id\` (\`cart_item_id\`)`)
    await connection.query(`ALTER TABLE \`cartitems\` ADD INDEX \`fk_cartitems_cart_id\` (\`cart_id\`)`)
    await connection.query(`ALTER TABLE \`cartitems\` ADD INDEX \`fk_cartitems_session_id\` (\`session_id\`)`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD UNIQUE INDEX \`idx_freesessiontoken_qr_token\` (\`qr_token\`)`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD INDEX \`fk_freesessiontoken_sub_id\` (\`sub_id\`)`)
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD UNIQUE INDEX \`idx_giftvoucher_qr_code\` (\`qr_code\`)`)
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD INDEX \`fk_giftvoucher_purchaser_user_id\` (\`purchaser_user_id\`)`)
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD INDEX \`fk_giftvoucher_session_id\` (\`session_id\`)`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_session_id\` (\`session_id\`)`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_booking_id\` (\`booking_id\`)`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_gift_voucher_id\` (\`gift_voucher_id\`)`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_order_id\` (\`order_id\`)`)
    await connection.query(`ALTER TABLE \`payments\` ADD INDEX \`fk_payments_related_user_id\` (\`related_user_id\`)`)
    await connection.query(`ALTER TABLE \`payments\` ADD INDEX \`fk_payments_order_id\` (\`order_id\`)`)
    await connection.query(`ALTER TABLE \`plan\` ADD UNIQUE INDEX \`idx_plan_plan\` (\`plan\`)`)
    await connection.query(`ALTER TABLE \`subscription\` ADD UNIQUE INDEX \`idx_subscription_stripe_subscription_id\` (\`stripe_subscription_id\`)`)
    await connection.query(`ALTER TABLE \`subscription\` ADD INDEX \`fk_subscription_user_id\` (\`user_id\`)`)
    await connection.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`idx_user_email\` (\`email\`)`)
    await connection.query(`ALTER TABLE \`userorder\` ADD INDEX \`fk_userorder_related_user_id\` (\`related_user_id\`)`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_availability_id\` FOREIGN KEY (\`availability_id\`) REFERENCES \`availability\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_simulator_id\` FOREIGN KEY (\`simulator_id\`) REFERENCES \`simulator\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_event_id\` FOREIGN KEY (\`event_id\`) REFERENCES \`event\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`fk_cart_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`cartitemrecipient\` ADD CONSTRAINT \`fk_cartitemrecipient_cart_item_id\` FOREIGN KEY (\`cart_item_id\`) REFERENCES \`cartitems\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE`)
    await connection.query(`ALTER TABLE \`cartitems\` ADD CONSTRAINT \`fk_cartitems_cart_id\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`cartitems\` ADD CONSTRAINT \`fk_cartitems_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`freesessiontoken\` ADD CONSTRAINT \`fk_freesessiontoken_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD CONSTRAINT \`fk_giftvoucher_purchaser_user_id\` FOREIGN KEY (\`purchaser_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`giftvoucher\` ADD CONSTRAINT \`fk_giftvoucher_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_booking_id\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`userorder\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`fk_payments_related_user_id\` FOREIGN KEY (\`related_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`fk_payments_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`userorder\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`subscription\` ADD CONSTRAINT \`fk_subscription_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
    await connection.query(`ALTER TABLE \`userorder\` ADD CONSTRAINT \`fk_userorder_related_user_id\` FOREIGN KEY (\`related_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT`)
  }

  async down(connection: any): Promise<void> {
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_user_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_availability_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_simulator_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_session_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_event_id\``)
    await connection.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`fk_booking_gift_voucher_id\``)
    await connection.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`fk_cart_user_id\``)
    await connection.query(`ALTER TABLE \`cartitemrecipient\` DROP FOREIGN KEY \`fk_cartitemrecipient_cart_item_id\``)
    await connection.query(`ALTER TABLE \`cartitems\` DROP FOREIGN KEY \`fk_cartitems_cart_id\``)
    await connection.query(`ALTER TABLE \`cartitems\` DROP FOREIGN KEY \`fk_cartitems_session_id\``)
    await connection.query(`ALTER TABLE \`freesessiontoken\` DROP FOREIGN KEY \`fk_freesessiontoken_sub_id\``)
    await connection.query(`ALTER TABLE \`giftvoucher\` DROP FOREIGN KEY \`fk_giftvoucher_purchaser_user_id\``)
    await connection.query(`ALTER TABLE \`giftvoucher\` DROP FOREIGN KEY \`fk_giftvoucher_session_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP FOREIGN KEY \`fk_orderdetails_session_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP FOREIGN KEY \`fk_orderdetails_booking_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP FOREIGN KEY \`fk_orderdetails_gift_voucher_id\``)
    await connection.query(`ALTER TABLE \`orderdetails\` DROP FOREIGN KEY \`fk_orderdetails_order_id\``)
    await connection.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`fk_payments_related_user_id\``)
    await connection.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`fk_payments_order_id\``)
    await connection.query(`ALTER TABLE \`subscription\` DROP FOREIGN KEY \`fk_subscription_user_id\``)
    await connection.query(`ALTER TABLE \`userorder\` DROP FOREIGN KEY \`fk_userorder_related_user_id\``)
    await connection.query(`DROP TABLE IF EXISTS \`availability\``)
    await connection.query(`DROP TABLE IF EXISTS \`booking\``)
    await connection.query(`DROP TABLE IF EXISTS \`cart\``)
    await connection.query(`DROP TABLE IF EXISTS \`cartitemrecipient\``)
    await connection.query(`DROP TABLE IF EXISTS \`cartitems\``)
    await connection.query(`DROP TABLE IF EXISTS \`event\``)
    await connection.query(`DROP TABLE IF EXISTS \`freesessiontoken\``)
    await connection.query(`DROP TABLE IF EXISTS \`giftvoucher\``)
    await connection.query(`DROP TABLE IF EXISTS \`orderdetails\``)
    await connection.query(`DROP TABLE IF EXISTS \`payments\``)
    await connection.query(`DROP TABLE IF EXISTS \`plan\``)
    await connection.query(`DROP TABLE IF EXISTS \`scheduleoverride\``)
    await connection.query(`DROP TABLE IF EXISTS \`scheduletemplate\``)
    await connection.query(`DROP TABLE IF EXISTS \`session\``)
    await connection.query(`DROP TABLE IF EXISTS \`simulator\``)
    await connection.query(`DROP TABLE IF EXISTS \`subscription\``)
    await connection.query(`DROP TABLE IF EXISTS \`user\``)
    await connection.query(`DROP TABLE IF EXISTS \`userorder\``)
  }

  async dryRun(connection: any): Promise<string[]> {
    return [
      "CREATE TABLE IF NOT EXISTS \`availability\` (\`id\` BIGINT AUTO_INCREMENT, \`date\` DATE, \`start_time\` VARCHAR(8), \`slots_total\` TINYINT, \`slots_remaining\` TINYINT, \`is_open\` BOOL, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`booking\` (\`id\` BIGINT AUTO_INCREMENT, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`pilots\` INT, \`price_paid\` FLOAT, \`is_free_session\` BOOL, \`status\` VARCHAR(50), \`cancelled_at\` TIMESTAMP, \`date\` DATE, \`user_id\` BIGINT, \`availability_id\` BIGINT, \`simulator_id\` BIGINT, \`session_id\` BIGINT, \`event_id\` BIGINT, \`gift_voucher_id\` BIGINT, \`checked_in\` BOOL, \`vehicle\` VARCHAR(255), \`checked_in_at\` TIMESTAMP, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`cart\` (\`id\` BIGINT AUTO_INCREMENT, \`user_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`cartitemrecipient\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255), \`cart_item_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`cartitems\` (\`id\` BIGINT AUTO_INCREMENT, \`cart_id\` BIGINT, \`session_id\` BIGINT, \`quantity\` INT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`event\` (\`id\` BIGINT AUTO_INCREMENT, \`title\` VARCHAR(255), \`description\` TEXT, \`date\` DATE, \`start_time\` VARCHAR(8), \`end_time\` VARCHAR(8), \`simulators_count\` TINYINT, \`pilots_per_simulator\` TINYINT, \`price\` FLOAT, \`vehicles\` TEXT, \`vehicle_categories\` TEXT, \`access\` VARCHAR(50), \`banner_image\` LONGTEXT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`freesessiontoken\` (\`id\` BIGINT AUTO_INCREMENT, \`qr_token\` VARCHAR(64) UNIQUE, \`is_used\` BOOL, \`used_at\` TIMESTAMP, \`created_at\` TIMESTAMP, \`sub_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`giftvoucher\` (\`id\` BIGINT AUTO_INCREMENT, \`recipient_name\` VARCHAR(200), \`recipient_email\` VARCHAR(255), \`qr_code\` VARCHAR(255) UNIQUE, \`status\` VARCHAR(50), \`used_at\` TIMESTAMP, \`stripe_payment_intent_id\` VARCHAR(255), \`amount_paid\` FLOAT, \`expires_at\` TIMESTAMP, \`purchaser_user_id\` BIGINT, \`session_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`orderdetails\` (\`id\` BIGINT AUTO_INCREMENT, \`price_each\` FLOAT, \`session_id\` BIGINT, \`booking_id\` BIGINT, \`gift_voucher_id\` BIGINT, \`quantity\` INT, \`order_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`payments\` (\`id\` BIGINT AUTO_INCREMENT, \`amount\` FLOAT, \`number\` BIGINT, \`related_user_id\` BIGINT, \`order_id\` BIGINT, \`status\` VARCHAR(50), \`stripe_charge_id\` VARCHAR(255), \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`plan\` (\`id\` BIGINT AUTO_INCREMENT, \`plan\` VARCHAR(10) UNIQUE, \`price\` FLOAT, \`stripe_price_id\` VARCHAR(255), PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`scheduleoverride\` (\`id\` BIGINT AUTO_INCREMENT, \`date\` DATE, \`open_time\` TIME, \`close_time\` TIME, \`is_open\` BOOL, \`description\` VARCHAR(80), PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`scheduletemplate\` (\`id\` BIGINT AUTO_INCREMENT, \`day_of_week\` TINYINT, \`open_time\` TIME, \`close_time\` TIME, \`is_open\` BOOL, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`session\` (\`id\` BIGINT AUTO_INCREMENT, \`name\` VARCHAR(100), \`duration_minutes\` TINYINT, \`price_normal\` FLOAT, \`price_member\` FLOAT, \`is_active\` BOOL, \`intro\` TEXT, \`details\` TEXT, \`total_duration\` VARCHAR(50), \`tagline\` TEXT, \`level\` VARCHAR(50), \`image\` VARCHAR(255), \`min_age\` TINYINT, \`min_height\` VARCHAR(20), \`min_pilots\` TINYINT, \`max_pilots\` TINYINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`simulator\` (\`id\` BIGINT AUTO_INCREMENT, \`name\` VARCHAR(100), \`is_active\` BOOL, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`subscription\` (\`id\` BIGINT AUTO_INCREMENT, \`stripe_subscription_id\` VARCHAR(255) UNIQUE, \`plan\` VARCHAR(10), \`pending_plan\` VARCHAR(10), \`price\` FLOAT, \`status\` VARCHAR(50), \`current_period_start\` TIMESTAMP, \`current_period_end\` TIMESTAMP, \`free_sessions_remaining\` INT, \`user_id\` BIGINT, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`user\` (\`id\` BIGINT AUTO_INCREMENT, \`firstname\` VARCHAR(255), \`lastname\` VARCHAR(255), \`email\` VARCHAR(255) UNIQUE, \`password\` VARCHAR(255), \`role\` VARCHAR(255), \`is_member\` BOOL, \`stripe_customer_id\` VARCHAR(255), \`created_at\` TIMESTAMP, \`updated_at\` TIMESTAMP, PRIMARY KEY (\`id\`))",
      "CREATE TABLE IF NOT EXISTS \`userorder\` (\`id\` BIGINT AUTO_INCREMENT, \`number\` BIGINT, \`related_user_id\` BIGINT, \`amount\` FLOAT, \`created_at\` TIMESTAMP, PRIMARY KEY (\`id\`))",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_user_id\` (\`user_id\`)",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_availability_id\` (\`availability_id\`)",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_simulator_id\` (\`simulator_id\`)",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_session_id\` (\`session_id\`)",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_event_id\` (\`event_id\`)",
      "ALTER TABLE \`booking\` ADD INDEX \`fk_booking_gift_voucher_id\` (\`gift_voucher_id\`)",
      "ALTER TABLE \`cart\` ADD INDEX \`fk_cart_user_id\` (\`user_id\`)",
      "ALTER TABLE \`cartitemrecipient\` ADD INDEX \`fk_cartitemrecipient_cart_item_id\` (\`cart_item_id\`)",
      "ALTER TABLE \`cartitems\` ADD INDEX \`fk_cartitems_cart_id\` (\`cart_id\`)",
      "ALTER TABLE \`cartitems\` ADD INDEX \`fk_cartitems_session_id\` (\`session_id\`)",
      "ALTER TABLE \`freesessiontoken\` ADD UNIQUE INDEX \`idx_freesessiontoken_qr_token\` (\`qr_token\`)",
      "ALTER TABLE \`freesessiontoken\` ADD INDEX \`fk_freesessiontoken_sub_id\` (\`sub_id\`)",
      "ALTER TABLE \`giftvoucher\` ADD UNIQUE INDEX \`idx_giftvoucher_qr_code\` (\`qr_code\`)",
      "ALTER TABLE \`giftvoucher\` ADD INDEX \`fk_giftvoucher_purchaser_user_id\` (\`purchaser_user_id\`)",
      "ALTER TABLE \`giftvoucher\` ADD INDEX \`fk_giftvoucher_session_id\` (\`session_id\`)",
      "ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_session_id\` (\`session_id\`)",
      "ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_booking_id\` (\`booking_id\`)",
      "ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_gift_voucher_id\` (\`gift_voucher_id\`)",
      "ALTER TABLE \`orderdetails\` ADD INDEX \`fk_orderdetails_order_id\` (\`order_id\`)",
      "ALTER TABLE \`payments\` ADD INDEX \`fk_payments_related_user_id\` (\`related_user_id\`)",
      "ALTER TABLE \`payments\` ADD INDEX \`fk_payments_order_id\` (\`order_id\`)",
      "ALTER TABLE \`plan\` ADD UNIQUE INDEX \`idx_plan_plan\` (\`plan\`)",
      "ALTER TABLE \`subscription\` ADD UNIQUE INDEX \`idx_subscription_stripe_subscription_id\` (\`stripe_subscription_id\`)",
      "ALTER TABLE \`subscription\` ADD INDEX \`fk_subscription_user_id\` (\`user_id\`)",
      "ALTER TABLE \`user\` ADD UNIQUE INDEX \`idx_user_email\` (\`email\`)",
      "ALTER TABLE \`userorder\` ADD INDEX \`fk_userorder_related_user_id\` (\`related_user_id\`)",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_availability_id\` FOREIGN KEY (\`availability_id\`) REFERENCES \`availability\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_simulator_id\` FOREIGN KEY (\`simulator_id\`) REFERENCES \`simulator\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_event_id\` FOREIGN KEY (\`event_id\`) REFERENCES \`event\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`booking\` ADD CONSTRAINT \`fk_booking_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`cart\` ADD CONSTRAINT \`fk_cart_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`cartitemrecipient\` ADD CONSTRAINT \`fk_cartitemrecipient_cart_item_id\` FOREIGN KEY (\`cart_item_id\`) REFERENCES \`cartitems\` (\`id\`) ON UPDATE CASCADE ON DELETE CASCADE",
      "ALTER TABLE \`cartitems\` ADD CONSTRAINT \`fk_cartitems_cart_id\` FOREIGN KEY (\`cart_id\`) REFERENCES \`cart\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`cartitems\` ADD CONSTRAINT \`fk_cartitems_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`freesessiontoken\` ADD CONSTRAINT \`fk_freesessiontoken_sub_id\` FOREIGN KEY (\`sub_id\`) REFERENCES \`subscription\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`giftvoucher\` ADD CONSTRAINT \`fk_giftvoucher_purchaser_user_id\` FOREIGN KEY (\`purchaser_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`giftvoucher\` ADD CONSTRAINT \`fk_giftvoucher_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_session_id\` FOREIGN KEY (\`session_id\`) REFERENCES \`session\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_booking_id\` FOREIGN KEY (\`booking_id\`) REFERENCES \`booking\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_gift_voucher_id\` FOREIGN KEY (\`gift_voucher_id\`) REFERENCES \`giftvoucher\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`orderdetails\` ADD CONSTRAINT \`fk_orderdetails_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`userorder\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`payments\` ADD CONSTRAINT \`fk_payments_related_user_id\` FOREIGN KEY (\`related_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`payments\` ADD CONSTRAINT \`fk_payments_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`userorder\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`subscription\` ADD CONSTRAINT \`fk_subscription_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT",
      "ALTER TABLE \`userorder\` ADD CONSTRAINT \`fk_userorder_related_user_id\` FOREIGN KEY (\`related_user_id\`) REFERENCES \`user\` (\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT"
    ]
  }
}
