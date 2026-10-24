-- School Clubs Hub: seed data. Run after 01_schema.sql.
-- Dates are relative to "today", so the data always looks current.

-- Users ---------------------------------------------------------------
insert into users (id, full_name, email, role, grade, avatar_color) values
('a0000000-0000-0000-0000-000000000001','Mariam Soliman','mariam.soliman@elsewedy-schools.edu.eg','admin',null,'#D91E2E'),
('a0000000-0000-0000-0000-000000000002','Hossam Fathy','hossam.fathy@elsewedy-schools.edu.eg','advisor',null,'#2563EB'),
('a0000000-0000-0000-0000-000000000003','Dina Adel','dina.adel@elsewedy-schools.edu.eg','advisor',null,'#7C3AED'),
('a0000000-0000-0000-0000-000000000004','Omar Khaled','omar.khaled@elsewedy-schools.edu.eg','club_leader','Grade 12','#0F766E'),
('a0000000-0000-0000-0000-000000000005','Salma Nabil','salma.nabil@elsewedy-schools.edu.eg','club_leader','Grade 12','#C2410C'),
('a0000000-0000-0000-0000-000000000006','Youssef Tarek','youssef.tarek@elsewedy-schools.edu.eg','club_leader','Grade 11','#4D7C0F'),
('a0000000-0000-0000-0000-000000000007','Nour Hassan','nour.hassan@elsewedy-schools.edu.eg','club_leader','Grade 12','#BE185D'),
('a0000000-0000-0000-0000-000000000008','Karim Ashraf','karim.ashraf@elsewedy-schools.edu.eg','club_leader','Grade 11','#0369A1'),
('a0000000-0000-0000-0000-000000000009','Layla Mostafa','layla.mostafa@elsewedy-schools.edu.eg','student','Grade 10','#9333EA'),
('a0000000-0000-0000-0000-000000000010','Ahmed Samir','ahmed.samir@elsewedy-schools.edu.eg','student','Grade 10','#B45309'),
('a0000000-0000-0000-0000-000000000011','Hana Ibrahim','hana.ibrahim@elsewedy-schools.edu.eg','student','Grade 11','#DB2777'),
('a0000000-0000-0000-0000-000000000012','Mostafa Reda','mostafa.reda@elsewedy-schools.edu.eg','student','Grade 9','#1D4ED8'),
('a0000000-0000-0000-0000-000000000013','Farida Emad','farida.emad@elsewedy-schools.edu.eg','student','Grade 11','#15803D'),
('a0000000-0000-0000-0000-000000000014','Adam Wael','adam.wael@elsewedy-schools.edu.eg','student','Grade 9','#A21CAF'),
('a0000000-0000-0000-0000-000000000015','Malak Sherif','malak.sherif@elsewedy-schools.edu.eg','student','Grade 10','#E11D48'),
('a0000000-0000-0000-0000-000000000016','Ziad Hatem','ziad.hatem@elsewedy-schools.edu.eg','student','Grade 12','#0E7490');

-- Clubs ---------------------------------------------------------------
insert into clubs (id, name, description, category, color, advisor_id) values
('c0000000-0000-0000-0000-000000000001','Robotics Club','Build, wire and program robots for school and inter-school competitions.','Technology','#D91E2E','a0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000002','Coding & AI Club','Learn to code, build apps and explore how AI works.','Technology','#2563EB','a0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000003','Photography Club','Photo walks, editing workshops and school exhibitions.','Arts','#7C3AED','a0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000004','Debate Society','Practise public speaking and structured argument.','Humanities','#C2410C','a0000000-0000-0000-0000-000000000003'),
('c0000000-0000-0000-0000-000000000005','Green Energy Club','Solar, recycling and sustainability projects around campus.','Science','#15803D','a0000000-0000-0000-0000-000000000003');

-- Memberships -----------------------------------------------------------
insert into club_members (club_id, user_id, role) values
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','leader'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','leader'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000006','leader'),
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000007','leader'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008','leader');

insert into club_members (club_id, user_id)
select c.id, u.id from (values
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000009'),
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000010'),
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000012'),
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000014'),
 ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000016'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000009'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000011'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000013'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000015'),
 ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000016'),
 ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000010'),
 ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011'),
 ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000013'),
 ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000015'),
 ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000009'),
 ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000012'),
 ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000014'),
 ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000015'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000010'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000011'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000012'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000013'),
 ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000016')
) as v(club_id, user_id)
join clubs c on c.id = v.club_id::uuid
join users u on u.id = v.user_id::uuid;

-- Events ---------------------------------------------------------------
insert into events (id, club_id, title, description, location, starts_at, ends_at, capacity, status, created_by) values
('e0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Line-follower robot workshop','Wire sensors, tune the controller and race your robot on the test track.','Lab 2', date_trunc('day',now())+interval '2 days 10 hours', date_trunc('day',now())+interval '2 days 12 hours', 20,'upcoming','a0000000-0000-0000-0000-000000000004'),
('e0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001','Inter-school robotics showcase','Teams from nearby schools demo their robots to students and parents.','Main hall', date_trunc('day',now())+interval '12 days 9 hours', date_trunc('day',now())+interval '12 days 14 hours', 120,'upcoming','a0000000-0000-0000-0000-000000000004'),
('e0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000002','Intro to Python for beginners','No experience needed. Bring a laptop or use a lab computer.','Computer lab 1', date_trunc('day',now())+interval '4 days 13 hours', date_trunc('day',now())+interval '4 days 15 hours', 25,'upcoming','a0000000-0000-0000-0000-000000000005'),
('e0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000002','Hackathon: build a school app','Teams of four build a working app for a real school problem in one day.','Innovation hub', date_trunc('day',now())+interval '20 days 9 hours', date_trunc('day',now())+interval '20 days 17 hours', 40,'upcoming','a0000000-0000-0000-0000-000000000005'),
('e0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000003','Golden hour photo walk','A guided walk around the campus gardens when the light is best.','School garden', date_trunc('day',now())+interval '6 days 15 hours', date_trunc('day',now())+interval '6 days 17 hours', 15,'upcoming','a0000000-0000-0000-0000-000000000006'),
('e0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000004','Open debate: phones in class','Two teams argue for and against phones in classrooms. The audience votes.','Theatre', date_trunc('day',now())+interval '9 days 12 hours', date_trunc('day',now())+interval '9 days 14 hours', 60,'upcoming','a0000000-0000-0000-0000-000000000007'),
('e0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000005','Solar panel demo day','See how solar panels charge a battery and power a small classroom.','Science yard', date_trunc('day',now())+interval '15 days 10 hours', date_trunc('day',now())+interval '15 days 13 hours', 50,'upcoming','a0000000-0000-0000-0000-000000000008'),
('e0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000003','Portrait lighting basics','Using window light and reflectors to shoot better portraits.','Art room', date_trunc('day',now())-interval '10 days'+interval '13 hours', date_trunc('day',now())-interval '10 days'+interval '15 hours', 20,'completed','a0000000-0000-0000-0000-000000000006'),
('e0000000-0000-0000-0000-000000000009','c0000000-0000-0000-0000-000000000004','Public speaking bootcamp','Short talks, live feedback and breathing techniques for stage nerves.','Theatre', date_trunc('day',now())-interval '5 days'+interval '12 hours', date_trunc('day',now())-interval '5 days'+interval '14 hours', 30,'completed','a0000000-0000-0000-0000-000000000007'),
('e0000000-0000-0000-0000-000000000010','c0000000-0000-0000-0000-000000000002','Cybersecurity awareness talk','Moved to next term because the guest speaker is unavailable.','Computer lab 2', date_trunc('day',now())+interval '7 days 11 hours', date_trunc('day',now())+interval '7 days 12 hours', 30,'cancelled','a0000000-0000-0000-0000-000000000005');

insert into event_registrations (event_id, user_id, status)
select e.id, m.user_id, case when e.status = 'completed' then 'attended' else 'registered' end
from events e join club_members m on m.club_id = e.club_id
where e.status in ('upcoming','completed') and random() < 0.75
on conflict do nothing;

-- Tasks ----------------------------------------------------------------
insert into tasks (club_id, event_id, title, description, status, priority, due_date, assigned_to, created_by, completed_at)
select v.club_id::uuid, v.event_id::uuid, v.title, v.description, v.status, v.priority,
       current_date + v.due, v.assigned::uuid, v.creator::uuid,
       case when v.status = 'done' then now() + (v.due || ' days')::interval else null end
from (values
('c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Order line sensors and motors','Eight sensor boards and four motor kits from the supplier.','done','high',-3,'a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Prepare workshop slides','Wiring diagram, controller tuning and race rules.','in_progress','medium',1,'a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001','Book Lab 2 and print worksheets',null,'todo','medium',1,'a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Recruit judges for the showcase','Ask two teachers and one parent from the engineering field.','todo','high',8,'a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002','Design the showcase poster',null,'review','medium',5,'a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000004'),
('c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000003','Create beginner Python exercises','Ten short exercises: variables, loops and functions.','in_progress','high',2,'a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000003','Set up lab computers with Python',null,'todo','high',3,'a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000004','Draft hackathon rules and scoring',null,'todo','medium',10,'a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000004','Find prize sponsors','Contact three local tech companies.','todo','low',14,'a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000002',null,'Collect sign-ups from last term',null,'done','low',-6,'a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000005'),
('c0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000005','Scout the photo walk route','Check light direction at 3 pm and avoid the construction area.','in_progress','medium',3,'a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000006'),
('c0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000005','Share camera tips handout',null,'todo','low',4,'a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000006'),
('c0000000-0000-0000-0000-000000000003','e0000000-0000-0000-0000-000000000008','Upload portrait session gallery',null,'done','medium',-8,'a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000006'),
('c0000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000006','Write motion and speaker rules','Speaking order, time limits and audience voting.','in_progress','high',4,'a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000007'),
('c0000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000006','Invite two guest teachers as judges',null,'todo','medium',6,'a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000007'),
('c0000000-0000-0000-0000-000000000004','e0000000-0000-0000-0000-000000000009','Collect bootcamp feedback forms',null,'review','low',-2,'a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000007'),
('c0000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000007','Borrow solar panels from the physics lab',null,'todo','high',8,'a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000008'),
('c0000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000007','Plan the demo day stations','Three stations: charging, lighting and a small fan.','in_progress','medium',10,'a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000008'),
('c0000000-0000-0000-0000-000000000005',null,'Weigh the school recycling totals','Weekly weights for paper, plastic and cans.','todo','medium',-2,'a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000008')
) as v(club_id, event_id, title, description, status, priority, due, assigned, creator);

-- Suggestions ------------------------------------------------------------
insert into suggestions (id, club_id, author_id, category, title, body, is_anonymous, status, response, responded_by, responded_at, created_at) values
('b0000000-0000-0000-0000-000000000001',null,'a0000000-0000-0000-0000-000000000010','facilities','More power outlets in the library','There are only two outlets near the study tables, so laptops run out of battery quickly.',false,'under_review','We are checking the cost with the maintenance team.','a0000000-0000-0000-0000-000000000001', now()-interval '1 day', now()-interval '6 days'),
('b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000013','event_idea','Game development night','A night where we build small games together in Scratch or Unity.',true,'accepted','Great idea. We will add it to next month''s schedule.','a0000000-0000-0000-0000-000000000005', now()-interval '2 days', now()-interval '8 days'),
('b0000000-0000-0000-0000-000000000003',null,'a0000000-0000-0000-0000-000000000011','activity','A club fair during break','New students do not know which clubs exist. A table for each club at break time would help.',false,'new',null,null,null, now()-interval '2 days'),
('b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000014','activity','Beginner-friendly build sessions','Some of us have never used a soldering iron. A basic session before the workshops would help.',true,'new',null,null,null, now()-interval '1 day'),
('b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000015','facilities','Borrow school cameras','Not everyone owns a camera. Can the club lend a few for the photo walks?',false,'implemented','Two cameras are now available from the media room. Ask Youssef to sign one out.','a0000000-0000-0000-0000-000000000006', now()-interval '3 days', now()-interval '12 days'),
('b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000012','event_idea','Plant a school garden','We could grow herbs near the science yard and use them in the canteen.',false,'under_review','We are asking the school administration about the space.','a0000000-0000-0000-0000-000000000008', now()-interval '1 day', now()-interval '5 days'),
('b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000009','other','Move debates to Thursday afternoons','Tuesday clashes with the swimming schedule, so half of us miss the debates.',false,'new',null,null,null, now()-interval '4 hours');

insert into suggestion_votes (suggestion_id, user_id)
select s.id, u.id from suggestions s cross join users u
where u.role in ('student','club_leader') and u.id <> s.author_id and random() < 0.4;

-- Notifications ----------------------------------------------------------
insert into notifications (user_id, type, title, message, link, is_read, created_at) values
('a0000000-0000-0000-0000-000000000009','event','New event: Hackathon: build a school app','Coding & AI Club is hosting a hackathon in about three weeks. Registration is open.','events',false, now()-interval '3 hours'),
('a0000000-0000-0000-0000-000000000009','task','New task: Recruit judges for the showcase','Omar Khaled assigned you a task. It is due in 8 days.','tasks',false, now()-interval '1 day'),
('a0000000-0000-0000-0000-000000000009','event','Registration confirmed','You are registered for Line-follower robot workshop.','events',true, now()-interval '2 days'),
('a0000000-0000-0000-0000-000000000009','system','Welcome to School Clubs Hub','Browse events, track your tasks and share ideas in the suggestion box.',null,true, now()-interval '14 days'),
('a0000000-0000-0000-0000-000000000004','suggestion','New suggestion for Robotics Club','"Beginner-friendly build sessions" was submitted anonymously.','suggestions',false, now()-interval '1 day'),
('a0000000-0000-0000-0000-000000000004','task','Task moved to review','Ziad Hatem finished "Design the showcase poster". Please review it.','tasks',false, now()-interval '5 hours'),
('a0000000-0000-0000-0000-000000000005','suggestion','Suggestion accepted','You responded to "Game development night".','suggestions',true, now()-interval '2 days'),
('a0000000-0000-0000-0000-000000000005','task','Task is due soon','"Create beginner Python exercises" is due in 2 days.','tasks',false, now()-interval '6 hours'),
('a0000000-0000-0000-0000-000000000010','suggestion','Your suggestion is under review','The school is checking "More power outlets in the library".','suggestions',false, now()-interval '1 day'),
('a0000000-0000-0000-0000-000000000010','task','Task overdue','"Weigh the school recycling totals" was due 2 days ago.','tasks',false, now()-interval '2 hours'),
('a0000000-0000-0000-0000-000000000013','suggestion','Your suggestion was accepted','Coding & AI Club accepted "Game development night".','suggestions',false, now()-interval '2 days'),
('a0000000-0000-0000-0000-000000000011','event','Event cancelled','Cybersecurity awareness talk was cancelled and moved to next term.','events',true, now()-interval '4 days'),
('a0000000-0000-0000-0000-000000000001','suggestion','New school-wide suggestion','"A club fair during break" is waiting for a response.','suggestions',false, now()-interval '2 days');
