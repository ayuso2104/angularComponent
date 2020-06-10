(function () {
    'use strict';


    module.exports = function (grunt) {
        // Cargar todas las tareas de grunt
        require('load-grunt-tasks')(grunt);
        // Project configuration.
        grunt.initConfig({
            path: 'src/main/resources/META-INF/web-resources',
            pkg: grunt.file.readJSON('package.json'),
            html: 'src/main/resources/META-INF/web-resources/js/directives/',
            jshint: {
                options: {
                    jshintrc: '.jshintrc'
                },
                all: [
                    '!<%= path %>/lib/**/*.js',
                    '<%= path %>/js/**/*.js',
                    '!**/*.min.js'
                ]
            },
            ngtemplates: {
                main: {
                    options: {
                        htmlmin: '<%= htmlmin.main.options %>',
                        module: 'angular-components'
                    },
                    cwd: '<%= html %>',
                    src: ['**/*.html'],
                    dest: 'temp/templates.js'
                }
            },
            clean: {
                before: {
                    src: ['dist', 'temp', '<%= path %>/js/<%= pkg.name %>-<%= pkg.version %>.min.js',
                        '<%= path %>/css/<%= pkg.name %>-<%= pkg.version %>.min.css']
                },
                after: {
                    src: ['temp', 'dist']
                }
            },
            removelogging: {
                dist: {
                    src: "temp/<%= pkg.name %>-<%= pkg.version %>.js", // Each file will be overwritten with the output!
                    options: {
                        verbose: true,
                        methods: ['log', 'debug', 'info']
                    }
                }
            },
            copy: {
                precss: {
                    src: '<%= path %>/**/*.css',
                    dest: 'temp/precss/',
                    options: {
                        processContent: function (content) {
                            var regexp = /url\("(\w*\/|\.\.?\/)*((\w*|-|_)*\.(png|jpg|jpeg))/g;
                            return content.replace(regexp, 'url("../images/iconos/$2');
                        }
                    },

                },
                css: {
                    expand: true,
                    cwd: 'dist/',
                    src: '<%= pkg.name %>-<%= pkg.version %>.min.css',
                    dest: '<%= path%>/css'
                },
                main: {
                    files: [
                        {
                            expand: true,
                            cwd: 'dist/',
                            src: '<%= pkg.name %>-<%= pkg.version %>.min.js',
                            dest: '<%= path%>/js'
                        },
                        {
                            expand: true,
                            cwd: '<%= path %>',
                            src: ['css/**/*.png', 'css/**/*.jpeg', 'css/**/*.jpg', 'css/**/*.gif',
                                'css/**/*.bmp'],
                            dest: '<%= path%>/images/iconos',
                            flatten: true
                        }
                    ],


                    //{src: ['bower_components/angular-ui-utils/ui-utils-ieshiv.min.js'], dest: 'dist/'},
                    //{src: ['bower_components/select2/*.png','bower_components/select2/*.gif'], dest:'dist/css/',flatten:true,expand:true},
                    //{src: ['bower_components/angular-mocks/angular-mocks.js'], dest: 'dist/'}

                }
            },

            cssmin: {
                target: {
                    options: {
                        keepSpecialComments: 0
                    },
                    files: [{
                        expand: true,
                        cwd: '<%= copy.precss.dest%>',
                        src: ['**/*.css',],
                        dest: 'temp/css',
                        ext: '.min.css'
                    }]
                }
            },
            concat: {
                dist: {

                    stripBanners: true,
                    src: ['<%= path %>/js/**/*.js', '<%= path %>/lib/**/*.js',
                        '!**/*min.js'],
                    dest: 'temp/<%= pkg.name %>-<%= pkg.version %>.js',
                },
                css: {

                    stripBanners: true,
                    src: [
                        'temp/css/src/main/resources/META-INF/web-resources/css/bootstrap.min.css',
                        'temp/css/src/main/resources/META-INF/web-resources/css/core/core.min.css',
                        'temp/css/src/main/resources/META-INF/web-resources/css/styles.min.css',
                        'temp/css/src/main/resources/META-INF/web-resources/css/loader.min.css',
                        'temp/css/**/*.css'],
                    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.css',
                },
                minificado: {

                    stripBanners: true,
                    src: ['<%= path %>/lib/angular.min.js',
                        '<%= path %>/lib/angular-translate/angular-translate.min.js',
                        '<%= path %>/lib/**/**.min.js',
                        '!<%= path %>/lib/angular-animate.min.js'
                    ],
                    dest: 'temp/minificado.min.js'
                },
                final: {
                    src: ['temp/minificado.min.js', 'temp/<%= pkg.name %>-<%= pkg.version %>.uglify.js', 'temp/templates.js',],
                    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
                }
            },

            uglify: {
                main: {
                    options: {
                        preserveComments: false
                    },
                    src: 'temp/<%= pkg.name %>-<%= pkg.version %>.js',
                    dest: 'temp/<%= pkg.name %>-<%= pkg.version %>.uglify.js'
                }
            },
            htmlmin: {
                main: {
                    options: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    },
                }
            },
        });

        grunt.registerTask('build', ['clean:before',
            'ngtemplates',
            'jshint',
            'copy:precss',
            'cssmin',
            'concat:css',
            'concat:minificado',
            'concat:dist',
            'concat:css',
            'removelogging',
            //'ngAnnotate',
            'uglify',
            'concat:final',
            'copy:css',
            'copy:main',
            //'htmlmin',
            //'clean:after'
        ]);
    };
    /*jslint node: true */
})();
