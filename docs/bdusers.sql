CREATE TABLE users
(
  id_user integer NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user varchar(25) NOT NULL,
  password varchar(25) NOT NULL,
  email varchar(320) NOT NULL
);

CREATE TABLE friends
(
  id_user1 integer NOT NULL,
  id_user2 integer NOT NULL,
  CONSTRAINT friends_pk PRIMARY KEY (id_user1,id_user2),
  CONSTRAINT friends_fk1 FOREIGN KEY (id_user1)
  REFERENCES users (id_user)
  ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT friends_fk2 FOREIGN KEY (id_user2)
  REFERENCES users (id_user)
  ON UPDATE NO ACTION ON DELETE NO ACTION
);


INSERT INTO users (user,password,email) values ("hectordavid1228","educatedguess1","hectordavid1228@gmail.com");
INSERT INTO users (user,password,email) values ("frank.valencia","educatedguess1","frank.valencia@gmail.com");
INSERT INTO users (user,password,email) values ("camilo.rueda","educatedguess1","camilo.rueda@gmail.com");

INSERT INTO friends (id_user1,id_user2) values (1,2);
INSERT INTO friends (id_user1,id_user2) values (1,3);
INSERT INTO friends (id_user1,id_user2) values (2,1);
INSERT INTO friends (id_user1,id_user2) values (3,1);



