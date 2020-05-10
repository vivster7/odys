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
-- Name: arrows; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.arrows (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    board_id integer NOT NULL,
    board_uuid uuid NOT NULL,
    from_shape_id uuid NOT NULL,
    to_shape_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.arrows OWNER TO postgres;

--
-- Name: TABLE arrows; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.arrows IS 'An arrow connects two shapes. It must have a direction (from, to).';


--
-- Name: boards; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.boards (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    room_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.boards OWNER TO postgres;

--
-- Name: TABLE boards; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.boards IS 'A board can be drawn on. Belongs to a room';


--
-- Name: rooms; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.rooms OWNER TO postgres;

--
-- Name: TABLE rooms; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.rooms IS 'User''s gather in a room to draw diagrams in real-time.';


--
-- Name: rooms_users; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.rooms_users (
    room_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.rooms_users OWNER TO postgres;

--
-- Name: shapes; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.shapes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    board_id uuid NOT NULL,
    x double precision NOT NULL,
    y double precision NOT NULL,
    width double precision NOT NULL,
    height double precision NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.shapes OWNER TO postgres;

--
-- Name: TABLE shapes; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON TABLE api.shapes IS 'A shape can be drawn on a board. Often as a rectangle, but could be a triangle, circle, etc. They can have text inside.';


--
-- Name: COLUMN shapes.x; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shapes.x IS 'top left x-coordinate of shape';


--
-- Name: COLUMN shapes.y; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shapes.y IS 'top left y-coordinate of shape';


--
-- Name: COLUMN shapes.width; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shapes.width IS 'distance to grow in the x-axis';


--
-- Name: COLUMN shapes.height; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shapes.height IS 'distance to grow in the y-axis';


--
-- Name: COLUMN shapes.text; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON COLUMN api.shapes.text IS 'content inside shape';


--
-- Name: users; Type: TABLE; Schema: api; Owner: postgres
--

CREATE TABLE api.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE api.users OWNER TO postgres;

--
-- Name: arrows arrows_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrows
    ADD CONSTRAINT arrows_pkey PRIMARY KEY (id);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: rooms_users rooms_users_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.rooms_users
    ADD CONSTRAINT rooms_users_pkey PRIMARY KEY (room_id, user_id);


--
-- Name: shapes shapes_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.shapes
    ADD CONSTRAINT shapes_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: arrows_board_id_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrows_board_id_idx ON api.arrows USING btree (board_id);


--
-- Name: arrows_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrows_created_at_idx ON api.arrows USING btree (created_at);


--
-- Name: arrows_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX arrows_updated_at_idx ON api.arrows USING btree (updated_at);


--
-- Name: boards_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX boards_created_at_idx ON api.boards USING btree (created_at);


--
-- Name: boards_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX boards_updated_at_idx ON api.boards USING btree (updated_at);


--
-- Name: rooms_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_created_at_idx ON api.rooms USING btree (created_at);


--
-- Name: rooms_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_updated_at_idx ON api.rooms USING btree (updated_at);


--
-- Name: rooms_users_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_users_created_at_idx ON api.rooms_users USING btree (created_at);


--
-- Name: rooms_users_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX rooms_users_updated_at_idx ON api.rooms_users USING btree (updated_at);


--
-- Name: shapes_board_id_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_board_id_idx ON api.shapes USING btree (board_id);


--
-- Name: shapes_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_created_at_idx ON api.shapes USING btree (created_at);


--
-- Name: shapes_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX shapes_updated_at_idx ON api.shapes USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX users_created_at_idx ON api.users USING btree (created_at);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: api; Owner: postgres
--

CREATE INDEX users_updated_at_idx ON api.users USING btree (updated_at);


--
-- Name: arrows arrows_board_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrows
    ADD CONSTRAINT arrows_board_id_fkey FOREIGN KEY (board_uuid) REFERENCES api.boards(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_board_id_fkey ON arrows; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_board_id_fkey ON api.arrows IS 'arrow belongs to a board';


--
-- Name: arrows arrows_from_shape_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrows
    ADD CONSTRAINT arrows_from_shape_id_fkey FOREIGN KEY (from_shape_id) REFERENCES api.shapes(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_from_shape_id_fkey ON arrows; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_from_shape_id_fkey ON api.arrows IS 'arrow start at from shape';


--
-- Name: arrows arrows_to_shape_id_fkt; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.arrows
    ADD CONSTRAINT arrows_to_shape_id_fkt FOREIGN KEY (to_shape_id) REFERENCES api.shapes(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT arrows_to_shape_id_fkt ON arrows; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT arrows_to_shape_id_fkt ON api.arrows IS 'arrow ends at to shape';


--
-- Name: rooms_users rooms_users_room_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.rooms_users
    ADD CONSTRAINT rooms_users_room_id_fkey FOREIGN KEY (room_id) REFERENCES api.rooms(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT rooms_users_room_id_fkey ON rooms_users; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT rooms_users_room_id_fkey ON api.rooms_users IS 'Many-to-many users to rooms';


--
-- Name: rooms_users rooms_users_user_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.rooms_users
    ADD CONSTRAINT rooms_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES api.users(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT rooms_users_user_id_fkey ON rooms_users; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT rooms_users_user_id_fkey ON api.rooms_users IS 'Many-to-many users to rooms';


--
-- Name: shapes shapes_board_id_fkey; Type: FK CONSTRAINT; Schema: api; Owner: postgres
--

ALTER TABLE ONLY api.shapes
    ADD CONSTRAINT shapes_board_id_fkey FOREIGN KEY (board_id) REFERENCES api.boards(id) ON DELETE CASCADE;


--
-- Name: CONSTRAINT shapes_board_id_fkey ON shapes; Type: COMMENT; Schema: api; Owner: postgres
--

COMMENT ON CONSTRAINT shapes_board_id_fkey ON api.shapes IS 'Shape belongs to a board';


--
-- Name: SCHEMA api; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA api TO anon;


--
-- Name: TABLE arrows; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.arrows TO anon;


--
-- Name: TABLE boards; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.boards TO anon;


--
-- Name: TABLE rooms; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.rooms TO anon;


--
-- Name: TABLE rooms_users; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.rooms_users TO anon;


--
-- Name: TABLE shapes; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.shapes TO anon;


--
-- Name: TABLE users; Type: ACL; Schema: api; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE api.users TO anon;


--
-- PostgreSQL database dump complete
--

