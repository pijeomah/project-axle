SET local check_function_bodies = off;

CREATE TABLE "public"."old_categories_deprecated" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "user_id"    uuid                     NOT NULL,
  "name"       character varying(100)   NOT NULL,
  "type"       character varying(20)    NOT NULL,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "is_system"  boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "categories_pkey" PRIMARY KEY (id),
  CONSTRAINT "categories_type_check" CHECK (((type)::text = ANY ((ARRAY['income'::character varying, 'expense'::character varying])::text[])))
);

CREATE TABLE "public"."payment-methods" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "user_id"    uuid                     NOT NULL,
  "name"       character varying(100)   NOT NULL,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "is_system"  boolean                  NOT NULL DEFAULT false,
  CONSTRAINT "payment_methods_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."tags" (
  "id"         uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                        NOT NULL,
  "name"       text                        NOT NULL,
  "type"       text                        NOT NULL,
  "is_active"  boolean                     DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  CONSTRAINT "tags_pkey" PRIMARY KEY (id),
  CONSTRAINT "tags_type_check" CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text, 'transfer'::text]))),
  CONSTRAINT "tags_user_id_name_kind_key" UNIQUE (user_id, name, TYPE)
);

CREATE TABLE "public"."transaction_lines" (
  "id"             uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "transaction_id" uuid                        NOT NULL,
  "wallet_id"      uuid                        NOT NULL,
  "tag_id"         uuid,
  "amount"         numeric(14,2)               NOT NULL,
  "direction"      text                        NOT NULL,
  "created_at"     timestamp without time zone DEFAULT now(),
  CONSTRAINT "transaction_lines_amount_check" CHECK ((amount > (0)::numeric)),
  CONSTRAINT "transaction_lines_direction_check" CHECK ((direction = ANY (ARRAY['debit'::text, 'credit'::text]))),
  CONSTRAINT "transaction_lines_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."transactions" (
  "id"               uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                        NOT NULL,
  "description"      text,
  "occurred_at"      date                        NOT NULL,
  "created_at"       timestamp without time zone DEFAULT now(),
  "is_voided"        boolean                     NOT NULL DEFAULT false,
  "transaction_type" text                        NOT NULL DEFAULT 'NORMAL'::text,
  CONSTRAINT "transactions_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."wallets" (
  "id"         uuid                        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                        NOT NULL,
  "name"       text                        NOT NULL,
  "type"       text                        NOT NULL,
  "is_system"  boolean                     DEFAULT false,
  "is_active"  boolean                     DEFAULT true,
  "created_at" timestamp without time zone DEFAULT now(),
  CONSTRAINT "wallets_kind_check" CHECK ((type = ANY (ARRAY['asset'::text, 'liability'::text, 'equity'::text, 'system'::text]))),
  CONSTRAINT "wallets_pkey" PRIMARY KEY (id),
  CONSTRAINT "wallets_user_id_name_key" UNIQUE (user_id, name)
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
DECLARE
  v_cash_account_id uuid;
  v_bank_account_id uuid;
  v_mobile_money_account_id uuid;
  v_sales_account_id uuid;
  v_consulting_account_id uuid;
  v_rent_account_id uuid;
  v_transport_account_id uuid;
  v_utilities_account_id uuid;
  v_supplies_account_id uuid;
  v_salaries_account_id uuid;
BEGIN
  -- Create Asset Accounts
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '1000', 'Cash', 'Asset', 'debit', true)
  RETURNING id INTO v_cash_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '1100', 'Bank Account', 'Asset', 'debit', true)
  RETURNING id INTO v_bank_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '1200', 'Mobile Money', 'Asset', 'debit', true)
  RETURNING id INTO v_mobile_money_account_id;
  
  -- Create Revenue Accounts
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '4000', 'Sales Revenue', 'Revenue', 'credit', true)
  RETURNING id INTO v_sales_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '4100', 'Consulting Revenue', 'Revenue', 'credit', true)
  RETURNING id INTO v_consulting_account_id;
  
  -- Create Expense Accounts
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '5000', 'Rent Expense', 'Expense', 'debit', true)
  RETURNING id INTO v_rent_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '5100', 'Transport Expense', 'Expense', 'debit', true)
  RETURNING id INTO v_transport_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '5200', 'Utilities Expense', 'Expense', 'debit', true)
  RETURNING id INTO v_utilities_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '5300', 'Supplies Expense', 'Expense', 'debit', true)
  RETURNING id INTO v_supplies_account_id;
  
  INSERT INTO public.accounts (user_id, account_code, account_name, account_type, normal_balance, is_system)
  VALUES (NEW.id, '5400', 'Salaries Expense', 'Expense', 'debit', true)
  RETURNING id INTO v_salaries_account_id;
  
  -- Create Payment Methods
  INSERT INTO public.payment_methods (user_id, name, account_id, is_system)
  VALUES 
    (NEW.id, 'Cash', v_cash_account_id, true),
    (NEW.id, 'Bank Account', v_bank_account_id, true),
    (NEW.id, 'Mobile Money', v_mobile_money_account_id, true);
  
  -- Create Income Categories
  INSERT INTO public.categories (user_id, name, type, account_id, is_system)
  VALUES 
    (NEW.id, 'Sales', 'income', v_sales_account_id, true),
    (NEW.id, 'Consulting', 'income', v_consulting_account_id, true);
  
  -- Create Expense Categories
  INSERT INTO public.categories (user_id, name, type, account_id, is_system)
  VALUES 
    (NEW.id, 'Rent', 'expense', v_rent_account_id, true),
    (NEW.id, 'Transport', 'expense', v_transport_account_id, true),
    (NEW.id, 'Utilities', 'expense', v_utilities_account_id, true),
    (NEW.id, 'Supplies', 'expense', v_supplies_account_id, true),
    (NEW.id, 'Salaries', 'expense', v_salaries_account_id, true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

ALTER TABLE "public"."old_categories_deprecated"
  ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."payment-methods"
  ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."tags"
  ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."transaction_lines"
  ADD CONSTRAINT "transaction_lines_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE RESTRICT;

ALTER TABLE "public"."transaction_lines"
  ADD CONSTRAINT "transaction_lines_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;

ALTER TABLE "public"."transactions"
  ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."transaction_lines"
  ADD CONSTRAINT "transaction_lines_wallet_id_fkey" FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE RESTRICT;

ALTER TABLE "public"."wallets"
  ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE VIEW "public"."transactions_with_type" AS  SELECT t.id,
    t.user_id,
    t.occurred_at,
    t.description,
    t.is_voided,
    tg.type AS transaction_type,
    sum(
        CASE
            WHEN (tl.direction = 'debit'::text) THEN tl.amount
            ELSE (0)::numeric
        END) AS amount
   FROM ((public.transactions t
     JOIN public.transaction_lines tl ON ((t.id = tl.transaction_id)))
     JOIN public.tags tg ON ((tl.tag_id = tg.id)))
  GROUP BY t.id, t.user_id, t.occurred_at, t.description, t.is_voided, tg.type;

CREATE VIEW "public"."transactions_with_amount" AS  SELECT t.id,
    t.user_id,
    t.description,
    t.occurred_at,
    t.is_voided,
    sum(
        CASE
            WHEN (tl.direction = 'debit'::text) THEN tl.amount
            ELSE (0)::numeric
        END) AS amount,
    twt.transaction_type
   FROM ((public.transactions t
     JOIN public.transaction_lines tl ON ((t.id = tl.transaction_id)))
     JOIN public.transactions_with_type twt ON ((twt.id = t.id)))
  GROUP BY t.id, t.user_id, t.description, t.occurred_at, t.is_voided, twt.transaction_type;

CREATE VIEW "public"."wallet_balances" AS  SELECT w.id,
    w.name,
    w.type,
    w.user_id,
    w.is_active,
    COALESCE(sum(
        CASE
            WHEN (tl.direction = 'debit'::text) THEN tl.amount
            ELSE (- tl.amount)
        END), (0)::numeric) AS balance
   FROM (public.wallets w
     LEFT JOIN public.transaction_lines tl ON ((w.id = tl.wallet_id)))
  GROUP BY w.id, w.name, w.type, w.user_id, w.is_active;

CREATE UNIQUE INDEX one_system_wallet_per_user ON public.wallets USING btree (user_id)
  WHERE (is_system = true);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users can create their own categories" ON "public"."old_categories_deprecated"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own categories" ON "public"."old_categories_deprecated"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own categories" ON "public"."old_categories_deprecated"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own categories" ON "public"."old_categories_deprecated"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can create their own payment methods" ON "public"."payment-methods"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own payment methods" ON "public"."payment-methods"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own payment methods" ON "public"."payment-methods"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own payment methods" ON "public"."payment-methods"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."old_categories_deprecated" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."old_categories_deprecated" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."old_categories_deprecated" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."old_categories_deprecated" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment-methods" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."payment-methods" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment-methods" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."payment-methods" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."tags" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transaction_lines" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."transaction_lines" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transaction_lines" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transaction_lines" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."transactions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."wallets" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallets" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_amount" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."transactions_with_amount" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_amount" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_amount" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_type" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."transactions_with_type" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_type" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."transactions_with_type" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallet_balances" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."wallet_balances" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallet_balances" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."wallet_balances" TO "service_role";

