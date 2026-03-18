import { Migration } from '@mikro-orm/migrations';

export class Migration20260317000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "dice_rtr_record" add column "session_id" text not null default 'legacy';`
    );
    this.addSql(
      `create index "dice_rtr_record_session_id_index" on "dice_rtr_record" ("session_id");`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "dice_rtr_record_session_id_index";`);
    this.addSql(`alter table "dice_rtr_record" drop column "session_id";`);
  }
}
