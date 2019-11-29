package com.prj.controller.Menu;

import com.prj.entity.ClassmenuVO;
import com.prj.entity.Menu;
import com.prj.server.menu.MenuServer;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class MenuController {


    @Autowired
    @Qualifier("MenuServerImpl")
    private MenuServer menuServer;
    //上一次文件存储
    private File lastFile;

    public MenuServer getMenuServer() {
        return menuServer;
    }

    public void setMenuServer(MenuServer menuServer) {
        this.menuServer = menuServer;
    }

    @ResponseBody
    @RequestMapping("/upload")
    public Map<String,Object> upload(@RequestParam("myfile") MultipartFile myfile, HttpServletRequest request) throws Exception {

        //判断用户是否选择文件
        //isEmpty()判断文件是否为空
        if(!myfile.isEmpty()){
            //删除上一次文件
            if(lastFile!=null){
                lastFile.delete();
                lastFile=null;
            }
            //获取上传的服务器地址
            String url=request.getSession().getServletContext().getRealPath("/upload/");
            //创建文件对象getOriginalFilename()获取文件名称
            File file=new File(url+System.currentTimeMillis()+myfile.getOriginalFilename());
            //把文件复制到目标地址FileUtils.copyInputStreamToFile(文件对象，目标地址对象)
            FileUtils.copyInputStreamToFile(myfile.getInputStream(),file);

            //保留上一次文件
            lastFile=file;
        }
        Map<String,Object> map = new HashMap<String,Object>();
        //返回json
        map.put("msg","ok");
        map.put("code",200);
        return map;
    }


    //添加菜单\
    //@ResponseBody响应json到页面，@RequestBody从页面提交json到后台
    @ResponseBody
    @RequestMapping("/addMenu")
    public String addMenu(@RequestBody ClassmenuVO classmenu) throws Exception{
        //判断当前试题是否置顶
        if(classmenu.getMenu().getIstop()!=1){
            classmenu.getMenu().setIstop(0);
        }

       int i= menuServer.addMenu(classmenu,lastFile);

       if(i>0){

           //提交说明用户确认了文件删除上一次临时文件
           lastFile=null;

           return "ok";
       }

       return "error";
    }



    //查询科目信息
    @ResponseBody
    @RequestMapping("/queryMenu")
    public Map<String,Object> queryMenu(){

        Map<String,Object> map=new HashMap<String,Object>();
        map.put("code","0");
        map.put("data",menuServer.queryMenu());

        return map;
    }


    //修改是否置顶
    @ResponseBody
    @RequestMapping("/updateIsTop/{id}/{istop}")
    public String updateIsTop(@PathVariable long id,@PathVariable int istop){

        //用户修改是否置顶
        if(istop==0){
            istop=1;
        }else {
            istop=0;
        }

        menuServer.updateIsTop(id,istop);

        return "ok";
    }



}
