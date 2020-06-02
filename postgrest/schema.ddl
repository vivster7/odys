--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: api; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA api;


ALTER SCHEMA api OWNER TO postgres;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: arrow; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.arrow (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    board_id uuid NOT NULL,
    from_shape_id uuid NOT NULL,
    to_shape_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE api.arrow OWNER TO postgres;

--
-- Name: TABLE arrow; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.arrow IS 'An arrow connects two shapes. It must have a direction (from, to).';


--
-- Name: board; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.board (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.board OWNER TO postgres;

--
-- Name: TABLE board; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.board IS 'A board can be drawn on. Belongs to a room';


--
-- Name: room; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.room (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.room OWNER TO postgres;

--
-- Name: TABLE room; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.room IS 'User''s gather in a room to draw diagrams in real-time.';


--
-- Name: room_user; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.room_user (
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.room_user OWNER TO postgres;

--
-- Name: shape; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.shape (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    board_id uuid NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    width double precision NOT NULL,
    height double precision NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    type text NOT NULL,
    created_at_zoom_level smallint NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    parent_id text DEFAULT ''::text NOT NULL
);


ALTER TABLE api.shape OWNER TO postgres;

--
-- Name: TABLE shape; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.shape IS 'A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.';


--
-- Name: COLUMN shape.x; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.x IS 'top left x-coordinate of shape';


--
-- Name: COLUMN shape.y; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.y IS 'top left y-coordinate of shape';


--
-- Name: COLUMN shape.width; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.width IS 'distance to grow in the x-axis';


--
-- Name: COLUMN shape.height; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.height IS 'distance to grow in the y-axis';


--
-- Name: COLUMN shape.text; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.text IS 'content inside shape';


--
-- Name: COLUMN shape.type; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.type IS 'e.g. rect, grouping_rect, text..';


--
-- Name: COLUMN shape.created_at_zoom_level; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shape.created_at_zoom_level IS 'a shape created at zoom level 5 will only be visible when around level 5';


--
-- Name: user; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api."user" OWNER TO postgres;

--
-- Name: arrow arrows_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrow
    ADD CONSTRAINT arrows_pkey PRIMARY KEY (id);


--
-- Name: board boards_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.board
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: room rooms_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.room
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: room_user rooms_users_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.room_user
    ADD CONSTRAINT rooms_users_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: shape shapes_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.shape
    ADD CONSTRAINT shapes_pkey PRIMARY KEY (id);


--
-- Name: user users_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api."user"
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: arrow_board_id_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrow_board_id_idx ON api.arrow USING btree (board_id);


--
-- Name: arrows_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrows_created_at_idx ON api.arrow USING btree (created_at);


--
-- Name: arrows_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrows_updated_at_idx ON api.arrow USING btree (updated_at);


--
-- Name: boards_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX boards_created_at_idx ON api.board USING btree (created_at);


--
-- Name: boards_room_id_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE UNIQUE INDEX boards_room_id_idx ON api.board USING btree (room_id);


--
-- Name: INDEX boards_room_id_idx; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON INDEX api.boards_room_id_idx IS 'A room can only have one board. For now.';


--
-- Name: boards_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX boards_updated_at_idx ON api.board USING btree (updated_at);


--
-- Name: rooms_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_created_at_idx ON api.room USING btree (created_at);


--
-- Name: rooms_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_updated_at_idx ON api.room USING btree (updated_at);


--
-- Name: rooms_users_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_users_created_at_idx ON api.room_user USING btree (created_at);


--
-- Name: rooms_users_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_users_updated_at_idx ON api.room_user USING btree (updated_at);


--
-- Name: shapes_board_id_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_board_id_idx ON api.shape USING btree (board_id);


--
-- Name: shapes_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_created_at_idx ON api.shape USING btree (created_at);


--
-- Name: shapes_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_updated_at_idx ON api.shape USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX users_created_at_idx ON api."user" USING btree (created_at);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX users_updated_at_idx ON api."user" USING btree (updated_at);


--
-- Name: arrow arrows_board_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrow
    ADD CONSTRAINT arrows_board_id_fkey FOREIGN KEY (board_id) REFERENCES api.board(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_board_id_fkey ON arrow; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_board_id_fkey ON api.arrow IS 'arrow belongs to a board';


--
-- Name: arrow arrows_from_shape_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrow
    ADD CONSTRAINT arrows_from_shape_id_fkey FOREIGN KEY (from_shape_id) REFERENCES api.shape(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_from_shape_id_fkey ON arrow; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_from_shape_id_fkey ON api.arrow IS 'arrow start at from shape';


--
-- Name: arrow arrows_to_shape_id_fkt; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrow
    ADD CONSTRAINT arrows_to_shape_id_fkt FOREIGN KEY (to_shape_id) REFERENCES api.shape(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_to_shape_id_fkt ON arrow; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_to_shape_id_fkt ON api.arrow IS 'arrow ends at to shape';


--
-- Name: board boards_room_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.board
    ADD CONSTRAINT boards_room_id_fkey FOREIGN KEY (room_id) REFERENCES api.room(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT boards_room_id_fkey ON board; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT boards_room_id_fkey ON api.board IS 'Board belongs to a room';


--
-- Name: room_user rooms_users_room_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.room_user
    ADD CONSTRAINT rooms_users_room_id_fkey FOREIGN KEY (room_id) REFERENCES api.room(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT rooms_users_room_id_fkey ON room_user; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT rooms_users_room_id_fkey ON api.room_user IS 'Many-to-many users to rooms';


--
-- Name: room_user rooms_users_user_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.room_user
    ADD CONSTRAINT rooms_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES api."user"(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT rooms_users_user_id_fkey ON room_user; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT rooms_users_user_id_fkey ON api.room_user IS 'Many-to-many users to rooms';


--
-- Name: shape shapes_board_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.shape
    ADD CONSTRAINT shapes_board_id_fkey FOREIGN KEY (board_id) REFERENCES api.board(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT shapes_board_id_fkey ON shape; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT shapes_board_id_fkey ON api.shape IS 'Shape belongs to a board';


--
-- Name: SCHEMA api; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA api TO anon;


--
-- Name: TABLE arrow; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.arrow TO anon;


--
-- Name: TABLE board; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.board TO anon;


--
-- Name: TABLE room; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.room TO anon;


--
-- Name: TABLE room_user; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.room_user TO anon;


--
-- Name: TABLE shape; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.shape TO anon;


--
-- Name: TABLE "user"; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api."user" TO anon;


--
-- PostgreSQL database dump complete
--

