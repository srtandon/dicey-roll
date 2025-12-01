import { Migration } from '@mikro-orm/migrations';

export class Migration20251112064548 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "dice_rtr_record" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "die_type" text not null, "result" int not null, constraint "dice_rtr_record_pkey" primary key ("id"));`);

    this.addSql(`create table "roll_dice_svc_record" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "message" text not null, constraint "roll_dice_svc_record_pkey" primary key ("id"));`);
  }

}
