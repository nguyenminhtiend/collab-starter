CREATE TABLE "document_changes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"doc_id" uuid NOT NULL,
	"data" "bytea" NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" varchar(255) DEFAULT 'Untitled' NOT NULL,
	"last_snapshot_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"doc_id" uuid NOT NULL,
	"state" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_changes" ADD CONSTRAINT "document_changes_doc_id_documents_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_doc_id_documents_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_changes_fetch" ON "document_changes" USING btree ("doc_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_snapshots_latest" ON "snapshots" USING btree ("doc_id","created_at");