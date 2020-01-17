var express = require('express');
var app = express();

// SHOW LIST of USERS
app.get('/', (req, res, next) => {
  req.getConnection((error, conn) => {
    conn.query('SELECT * FROM users ORDER BY id DESC', (err, rows, fields) => {
      // if (err throw err)
      if (err) {
        req.flash('error', err);
        res.render('user/list', {
          title: 'User List',
          data: ''
        });
      } else {
        // if success, render views/user/list.ejs template file
        res.render('user/list', {
          title: 'User List',
          data: rows
        });
      }
    });
  });
});

// SHOW ADD USER FORM
app.get('/add', (req, res, next) => {
  // kita akan merender views/user/add.ejs
  res.render('user/add', {
    title: 'Add New User',
    name: '',
    age: '',
    email: ''
  });
});

// ADD NEW USER POST ACTION
app.post('/add', (req, res, next) => {
  req.assert('name', 'Name is required').notEmpty();
  req.assert('age', 'Age is required').notEmpty();
  req.assert('email', 'a valid email is required').isEmail();

  var errors = req.validationErrors();

  if (!errors) {
    // if No errors were found, passed validation!
    /********************************************
             * Express-validator module
             
            req.body.comment = 'a <span>comment</span>';
            req.body.username = '   a user    ';
     
            req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
            req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
    var user = {
      name: req
        .sanitize('name')
        .escape()
        .trim(),
      age: req
        .sanitize('age')
        .escape()
        .trim(),
      email: req
        .sanitize('email')
        .escape()
        .trim()
    };

    req.getConnection((err, conn) => {
      conn.query('INSERT INTO users SET ?', user, (err, result) => {
        // if(err) throw err
        if (err) {
          req.flash('error', err);
          // render to views/user/add.ejs
          res.render('user/add', {
            title: 'Add New User',
            name: user.name,
            age: user.age,
            email: user.email
          });
        } else {
          req.flash('success', 'Data added succesfully.!');
          // render to views/user/add.ejs
          res.render('user/add', {
            title: 'Add New User',
            name: '',
            age: '',
            email: ''
          });
        }
      });
    });
  } else {
    //Display errors to user
    var error_msg = '';
    errors.forEach(error => {
      error_msg += error.msg + '<br>';
    });
    req.flash('error', error_msg);
    /**
     * Using req.body.name
     * because req.param('name') is deprecated
     */

    res.render('user/add', {
      title: 'Add New User',
      name: req.body.name,
      age: req.body.age,
      email: req.body.email
    });
  }
});

// SHOW EDIT FORM
app.get('/edit/:id', (req, res, next) => {
  req.getConnection((err, conn) => {
    conn.query(
      'SELECT * FROM users WHERE id=' + req.params.id,
      (err, rows, fields) => {
        if (err) throw err;

        // if user not found
        if (rows.length <= 0) {
          req.flash('error', 'User not found with id = ' + req.params.id);
          req.redirect('/users');
        } else {
          // if user found
          // render to views/user/edit.ejs template file
          res.render('user/edit', {
            title: 'Edit User',
            // data: rows[0]
            id: rows[0].id,
            name: rows[0].name,
            age: rows[0].age,
            email: rows[0].email.trim()
          });
        }
      }
    );
  });
});

// EDIT USER POST ACTION
app.put('/edit/:id', function(req, res, next) {
  req.assert('name', 'Name is required').notEmpty()           //Validate name
  req.assert('age', 'Age is required').notEmpty()             //Validate age
  req.assert('email', 'A valid email is required').trim().isEmail()  //Validate email

  var errors = req.validationErrors()
  
  if( !errors ) {   //No errors were found.  Passed Validation!
      
      /********************************************
       * Express-validator module
       
      req.body.comment = 'a <span>comment</span>';
      req.body.username = '   a user    ';

      req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
      req.sanitize('username').trim(); // returns 'a user'
      ********************************************/
      var user = {
          name: req.sanitize('name').escape().trim(),
          age: req.sanitize('age').escape().trim(),
          email: req.sanitize('email').escape().trim()
      }
      
      req.getConnection(function(error, conn) {
          conn.query('UPDATE users SET ? WHERE id = ' + req.params.id, user, function(err, result) {
              //if(err) throw err
              if (err) {
                  req.flash('error', err)
                  
                  // render to views/user/add.ejs
                  res.render('user/edit', {
                      title: 'Edit User',
                      id: req.params.id,
                      name: req.body.name,
                      age: req.body.age,
                      email: req.body.email
                  })
              } else {
                  req.flash('success', 'Data updated successfully!')
                  
                  // render to views/user/add.ejs
                  res.render('user/edit', {
                      title: 'Edit User',
                      id: req.params.id,
                      name: req.body.name,
                      age: req.body.age,
                      email: req.body.email
                  })
                  // res.redirect('/users')
              }
          })
      })
  }
  else {   //Display errors to user
      var error_msg = ''
      errors.forEach(function(error) {
          error_msg += error.msg + '<br>'
      })
      req.flash('error', error_msg)
      
      /**
       * Using req.body.name 
       * because req.param('name') is deprecated
       */ 
      res.render('user/edit', { 
          title: 'Edit User',            
          id: req.params.id, 
          name: req.body.name,
          age: req.body.age,
          email: req.body.email
      })
  }
})

// DELETE USER
app.delete('/delete/(:id)', function(req, res, next) {
  var user = { id: req.params.id }
  
  req.getConnection(function(error, conn) {
      conn.query('DELETE FROM users WHERE id = ' + req.params.id, user, function(err, result) {
          //if(err) throw err
          if (err) {
              req.flash('error', err)
              // redirect to users list page
              res.redirect('/users')
          } else {
              req.flash('success', 'User deleted successfully! id = ' + req.params.id)
              // redirect to users list page
              res.redirect('/users')
          }
      })
  })
})

module.exports = app;
