<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getbrand">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="brand" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="品牌名称" width="120" sortable>
			</el-table-column>
			<el-table-column prop="englishName" label="英文名称" width="150" sortable>
			</el-table-column>
			<el-table-column prop="logo" label="logo" width="150" sortable>
			</el-table-column>
			<el-table-column prop="productType.name" label="类型" width="150" sortable>
			</el-table-column>
			<el-table-column prop="description" label="描述" min-width="180" sortable>
			</el-table-column>
			<el-table-column label="操作" width="150">
				<!--自定义列显示的模板-->
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<!--  scope.$index 行索引      scope.row  该行数据  -->
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->

		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="品牌名称" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="英文名称" prop="englishName">
					<el-input v-model="editForm.englishName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="productTypeId">
					<el-input v-model="editForm.productTypeId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="editForm.description"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<!--
		v-model  true/false 模态框是否显示
		elementui组件有方法，我们只有获取到组件对象后才能调用他的方法
		如何去获取到组件对象
		(1)组件上添加 ref属性
		(2)this.$refs.addForm 获取到组件对象
		  -->
		<el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" size="tiny">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<!--label 表单组件的信息  prop  验证使用-->
				<el-form-item label="品牌名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="英文名称" prop="englishName">
					<el-input v-model="addForm.englishName" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="类型" prop="productTypeId">
					<el-input v-model="addForm.productTypeId" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述">
					<el-input type="textarea" v-model="addForm.description"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	export default {
		data() {
			return {
				filters: {
                    keyword: ''
				},
				brand: [],
				total: 0,
				page: 1,
                pageSize:10,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				}

			}
		},
		methods: {
			//性别显示转换
			formatSex: function (row, column) {
				return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getbrand();
			},
			//获取用户列表
			getbrand() {
				this.listLoading = true;
				//NProgress.start();
				this.$http.post("/product/brand/json",{
                    pageNum:this.page,
                    pageSize:this.pageSize,
                    keyword:this.filters.keyword
				}).then(res=>{
                    this.listLoading = false;
                    let pageList = res.data;
                    this.brand=pageList.rows;
                    this.total=pageList.total;
				})
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
				    //删除
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };

					this.$http.delete("/product/brand/delete/"+row.id).then(res=>{
                        this.listLoading = false;
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getbrand();
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
						}

                    })
                })

					/*removeUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getbrand();
					});
				}).catch(() => {

				});*/
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
                            this.$http.post("/product/brand/add",para)
                                .then(res=>{
                                    this.editLoading = false;
                                    let data = res.data;
                                    if(data.success){
                                        this.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        this.$refs['editForm'].resetFields();//清空表单
                                        this.editFormVisible = false;//关闭模态框
                                        this.getbrand();//重新加载表格数据
                                    }else{
                                        this.$message({
                                            message: data.message,
                                            type: 'error'
                                        });
                                    }
                                })
							/*para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							editUser(para).then((res) => {
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.getbrand();
							});*/
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
                            this.$http.post("/product/brand/add",para)
                                .then(res=>{
                                    this.addLoading = false;
                                    let data = res.data;
                                    if(data.success){
                                        this.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        this.$refs['addForm'].resetFields();//清空表单
                                        this.addFormVisible = false;//关闭模态框
                                        //重新加载表格数据
                                        this.getbrand();
                                    }else{
                                        this.$message({
                                            message: data.message,
                                            type: 'error'
                                        });
                                    }
                                })
							/*para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getbrand();
							});*/
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
                    this.$http.delete("/product/brand/deletemore/"+ids).then(res=>{
                        this.listLoading = false;
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getbrand();
                        }else {
                            this.$message({
                                message: res.data.message,
                                type: 'error'
                            });
                        }

                    })

					/*batchRemoveUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getbrand();
					});*/
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getbrand();
		}
	}

</script>

<style scoped>

</style>