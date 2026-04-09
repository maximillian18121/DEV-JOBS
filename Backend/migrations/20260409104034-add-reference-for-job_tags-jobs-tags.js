'use strict';


/** @type {import('sequelize-cli').Migration} */
export  default {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('job_tags', "job_id", {
      
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:"Jobs",
          key:"id"
        }
      
    });

    await queryInterface.changeColumn('job_tags', "tag_id", {
      
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:"tags",
          key:"id"
        }
      
    });

    await queryInterface.addIndex('job_tags', ['job_id', 'tag_id'],{
      unique: true,
      name: "unique_tag_job_save"
    })
    
    await queryInterface.addIndex('Jobs', ['company_id', 'posted_by'],{
      unique: true,
      name: "unique_user_company_save"
    })
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('job_tags', "job_id", {
      
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
      
    });

    await queryInterface.changeColumn('job_tags', "tag_id", {
      
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
      
    });

    // Remove unique constraint
    await queryInterface.removeIndex("saved_jobs", "unique_tag_job_save");

    await queryInterface.removeIndex("Jobs", "unique_user_company_save");


  
  }
};
